/* ************************************************************************

   qxapp - the simcore frontend

   https://osparc.io

   Copyright:
     2018 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

/**
 * Widget that shows two lists of studies and study editor form:
 * - List1: User's studies (StudyBrowserListItem)
 * - List2: Template studies to start from (StudyBrowserListItem)
 * - Form: Extra editable information of the selected study
 *
 * It is the entry point to start editing or creatina new study.
 *
 * Also takes care of retrieveing the list of services and pushing the changes in the metadata.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   let prjBrowser = this.__serviceBrowser = new qxapp.desktop.StudyBrowser();
 *   this.getRoot().add(prjBrowser);
 * </pre>
 */

qx.Class.define("qxapp.desktop.StudyBrowser", {
  extend: qx.ui.core.Widget,

  construct: function() {
    this.base(arguments);

    this.__studyResources = qxapp.io.rest.ResourceFactory.getInstance().createStudyResources();
    // this._projectResources.projects
    // this._projectResources.project
    // this._projectResources.templates

    let studyBrowserLayout = new qx.ui.layout.VBox(20);
    this._setLayout(studyBrowserLayout);

    let iframe = qxapp.utils.Utils.createLoadingIFrame(this.tr("Studies"));
    this._add(iframe, {
      flex: 1
    });

    const interval = 1000;
    let userTimer = new qx.event.Timer(interval);
    userTimer.addListener("interval", () => {
      if (this.__userReady) {
        userTimer.stop();
        this._removeAll();
        iframe.dispose();
        this.__createStudiesLayout();
        this.__createCommandEvents();
      }
    }, this);
    userTimer.start();

    this.__initResources();
  },

  events: {
    "startStudy": "qx.event.type.Data"
  },

  members: {
    __userReady: null,
    __servicesReady: null,
    __studyResources: null,
    __userStudyList: null,
    __templateStudyList: null,
    __editStudyLayout: null,
    __creatingNewStudy: null,

    __initResources: function() {
      this.__getUserProfile();
      this.__getServicesPreload();
    },

    __getUserProfile: function() {
      let permissions = qxapp.data.Permissions.getInstance();
      permissions.addListener("userProfileRecieved", e => {
        this.__userReady = e.getData();
      }, this);
      permissions.loadUserRoleFromBackend();
    },

    __getServicesPreload: function() {
      let store = qxapp.data.Store.getInstance();
      store.addListener("servicesRegistered", e => {
        this.__servicesReady = e.getData();
      }, this);
      store.getServices(true);
    },

    __createStudiesLayout: function() {
      const navBarLabelFont = qx.bom.Font.fromConfig(qxapp.theme.Font.fonts["nav-bar-label"]);
      let myStudyLabel = new qx.ui.basic.Label(this.tr("My Studies")).set({
        font: navBarLabelFont,
        minWidth: 150
      });
      let userStudyList = this.__createUserStudyList();
      let userStudyLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      userStudyLayout.add(myStudyLabel);
      userStudyLayout.add(userStudyList);

      let tempStudyLabel = new qx.ui.basic.Label(this.tr("Template Studies")).set({
        font: navBarLabelFont,
        minWidth: 150
      });
      let tempStudyList = this.__createTemplateStudyList();
      let tempStudyLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      tempStudyLayout.add(tempStudyLabel);
      tempStudyLayout.add(tempStudyList);

      let editStudyLayout = this.__editStudyLayout = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
      editStudyLayout.setMaxWidth(800);
      let editStudyLabel = new qx.ui.basic.Label(this.tr("Edit Study")).set({
        font: navBarLabelFont,
        minWidth: 150
      });
      editStudyLayout.add(editStudyLabel);
      editStudyLayout.setVisibility("excluded");

      this._add(userStudyLayout);
      this._add(tempStudyLayout);
      this._add(this.__editStudyLayout);
    },

    __createCommandEvents: function() {
      let commandEsc = new qx.ui.command.Command("Esc");
      commandEsc.addListener("execute", e => {
        this.__itemSelected(null);
      });
    },

    __newStudyBtnClkd: function() {
      if (this.__creatingNewStudy) {
        return;
      }
      this.__creatingNewStudy = true;

      let win = new qx.ui.window.Window(this.tr("Create New Study")).set({
        layout: new qx.ui.layout.Grow(),
        contentPadding: 0,
        showMinimize: false,
        showMaximize: false,
        minWidth: 500,
        centerOnAppear: true,
        autoDestroy: true
      });

      let newStudyDlg = new qxapp.component.widget.NewStudyDlg();
      newStudyDlg.addListenerOnce("createStudy", e => {
        const data = e.getData();
        const newStudy = {
          name: data.prjTitle,
          description: data.prjDescription
        };
        this.__startStudy(newStudy, true);
        win.close();
      }, this);
      win.add(newStudyDlg);
      win.open();
      win.addListener("close", () => {
        this.__creatingNewStudy = false;
      }, this);
    },

    __startStudy: function(studyData, isNew = false) {
      if (this.__servicesReady === null) {
        this.__showChildren(false);
        let iframe = qxapp.utils.Utils.createLoadingIFrame(this.tr("Services"));
        this._add(iframe, {
          flex: 1
        });

        const interval = 1000;
        let servicesTimer = new qx.event.Timer(interval);
        servicesTimer.addListener("interval", () => {
          if (this.__servicesReady) {
            servicesTimer.stop();
            this._remove(iframe);
            iframe.dispose();
            this.__showChildren(true);
            this.__loadStudy(studyData, isNew);
          }
        }, this);
        servicesTimer.start();
      } else {
        this.__loadStudy(studyData, isNew);
      }
    },

    __showChildren: function(show) {
      let children = this._getChildren();
      for (let i=0; i<children.length; i++) {
        if (show) {
          children[i].setVisibility("visible");
        } else {
          children[i].setVisibility("excluded");
        }
      }
    },

    __loadStudy: function(studyData, isNew) {
      let study = new qxapp.data.model.Study(studyData);
      let studyEditor = new qxapp.desktop.StudyEditor(study, isNew);
      this.fireDataEvent("startStudy", studyEditor);
    },

    __createStudy: function(studyId, fromTemplate = false) {
      let resource = this.__studyResources.project;

      resource.addListenerOnce("getSuccess", e => {
        // TODO: is this listener added everytime we call ?? It does not depend on input params
        // but it needs to be here to implemenet startStudy
        let studyData = e.getRequest().getResponse().data;
        if (fromTemplate) {
          studyData = qxapp.utils.Utils.replaceTemplateUUIDs(studyData);
          studyData["prjOwner"] = qxapp.auth.Data.getInstance().getUserName();
        }
        this.__startStudy(studyData, fromTemplate);
      }, this);

      resource.addListener("getError", e => {
        console.error(e);
      });

      resource.get({
        "project_id": studyId
      });
    },

    __createUserStudyList: function() {
      // layout
      let usrLst = this.__userStudyList = this.__creteStudyListLayout();
      usrLst.addListener("changeSelection", e => {
        if (e.getData() && e.getData().length>0) {
          this.__templateStudyList.resetSelection();
          const selectedId = e.getData()[0].getModel();
          if (selectedId) {
            this.__itemSelected(selectedId, false);
          } else {
            // "New Study" selected
            this.__itemSelected(null);
          }
        }
      }, this);

      this.reloadUserStudies();

      return usrLst;
    },

    reloadUserStudies: function() {
      // resources
      this.__userStudyList.removeAll();

      let resources = this.__studyResources.projects;

      resources.addListenerOnce("getSuccess", e => {
        let userStudyList = e.getRequest().getResponse().data;
        let userStudyArrayModel = this.__getStudyArrayModel(userStudyList);
        userStudyArrayModel.unshift(qx.data.marshal.Json.createModel({
          name: this.tr("New Study"),
          thumbnail: "@FontAwesome5Solid/plus-circle/80",
          uuid: null,
          lastChangeDate: null,
          prjOwner: null
        }));
        // controller
        let studyCtr = new qx.data.controller.List(userStudyArrayModel, this.__userStudyList, "name");
        const fromTemplate = false;
        let delegate = this.__getDelegate(fromTemplate, this.__userStudyList);
        studyCtr.setDelegate(delegate);
      }, this);

      resources.addListener("getError", e => {
        console.error(e);
      }, this);

      resources.get();

      this.__itemSelected(null);
    },

    __createTemplateStudyList: function() {
      // layout
      let tempList = this.__templateStudyList = this.__creteStudyListLayout();
      tempList.addListener("changeSelection", e => {
        if (e.getData() && e.getData().length>0) {
          this.__userStudyList.resetSelection();
          const selectedId = e.getData()[0].getModel();
          this.__itemSelected(selectedId, true);
        }
      }, this);

      this.reloadTemplateStudies();

      return tempList;
    },

    reloadTemplateStudies: function() {
      // resources
      this.__templateStudyList.removeAll();

      let resources = this.__studyResources.templates;

      resources.addListenerOnce("getSuccess", e => {
        let tempStudyList = e.getRequest().getResponse().data;
        let tempFilteredStudyList = [];
        for (let i=0; i<tempStudyList.length; i++) {
          // FIXME: Backend should do the filtering
          if (tempStudyList[i].uuid.includes("DemoDecember") &&
          !qxapp.data.Permissions.getInstance().canDo("test")) {
            continue;
          }
          tempFilteredStudyList.push(tempStudyList[i]);
        }

        let tempStudyArrayModel = this.__getStudyArrayModel(tempFilteredStudyList);
        // controller
        let studyCtr = new qx.data.controller.List(tempStudyArrayModel, this.__templateStudyList, "name");
        const fromTemplate = true;
        let delegate = this.__getDelegate(fromTemplate, this.__templateStudyList);
        studyCtr.setDelegate(delegate);
      }, this);

      resources.addListener("getError", e => {
        console.error(e);
      }, this);

      resources.get();

      this.__itemSelected(null);
    },

    __creteStudyListLayout: function() {
      let list = new qx.ui.form.List().set({
        orientation: "horizontal",
        spacing: 10,
        height: 200,
        alignY: "middle",
        appearance: "pb-list"
      });
      return list;
    },

    /**
     * Delegates appearance and binding of each study item
     */
    __getDelegate: function(fromTemplate, list) {
      const thumbnailWidth = 200;
      const thumbnailHeight = 120;
      const nThumbnails = 25;
      let thumbnailCounter = 0;
      let that = this;
      let delegate = {
        // Item's Layout
        createItem: function() {
          let item = new qxapp.desktop.StudyBrowserListItem();
          item.addListener("dbltap", e => {
            const studyUuid = item.getModel();
            if (studyUuid) {
              that.__createStudy(studyUuid, fromTemplate); // eslint-disable-line no-underscore-dangle
            }
          });
          item.addListener("tap", e => {
            const studyUuid = item.getModel();
            if (studyUuid) {
              list.setSelection([item]); // eslint-disable-line no-underscore-dangle
            } else {
              that.__newStudyBtnClkd(); // eslint-disable-line no-underscore-dangle
            }
          });
          return item;
        },
        // Item's data binding
        bindItem: function(controller, item, id) {
          controller.bindProperty("thumbnail", "icon", {
            converter: function(data) {
              let thumbnailId = thumbnailCounter + (fromTemplate ? 10 : 0);
              if (thumbnailId >= nThumbnails) {
                thumbnailId -= nThumbnails;
              }
              let thumbnailUrl = data.match(/^@/) ? data : "qxapp/img"+ thumbnailId +".jpg";
              thumbnailCounter++;
              return thumbnailUrl;
            }
          }, item, id);
          controller.bindProperty("name", "prjTitle", {
            converter: function(data) {
              return "<b>" + data + "</b>";
            }
          }, item, id);
          controller.bindProperty("prjOwner", "creator", {
            converter: function(data) {
              return data ? "Created by: <b>" + data + "</b>" : null;
            }
          }, item, id);
          controller.bindProperty("lastChangeDate", "lastChangeDate", {
            converter: function(data) {
              return data ? new Date(data) : null;
            }
          }, item, id);
          controller.bindProperty("uuid", "model", {
            converter: function(data) {
              return data;
            }
          }, item, id);
        },
        configureItem: item => {
          item.getChildControl("icon").set({
            width: thumbnailWidth,
            height: thumbnailHeight,
            scale: true
          });
        }
      };

      return delegate;
    },

    __itemSelected: function(studyId, fromTemplate = false) {
      if (studyId === null) {
        if (this.__userStudyList) {
          this.__userStudyList.resetSelection();
        }
        if (this.__templateStudyList) {
          this.__templateStudyList.resetSelection();
        }
        if (this.__editStudyLayout) {
          this.__editStudyLayout.setVisibility("excluded");
        }
        return;
      }

      let resource = this.__studyResources.project;

      resource.addListenerOnce("getSuccess", e => {
        this.__editStudyLayout.setVisibility("visible");
        let studyData = e.getRequest().getResponse().data;
        this.__createForm(studyData, fromTemplate);
        console.log(studyData);
      }, this);

      resource.addListener("getError", e => {
        console.error(e);
      });

      resource.get({
        "project_id": studyId
      });
    },

    __createForm: function(studyData, fromTemplate) {
      while (this.__editStudyLayout.getChildren().length > 1) {
        this.__editStudyLayout.removeAt(1);
      }

      const itemsToBeDisplayed = ["name", "description", "notes", "prjOwner", "collaborators", "creationDate", "lastChangeDate"];
      const itemsToBeModified = fromTemplate ? [] : ["name", "description", "notes"];
      let form = new qx.ui.form.Form();
      let control;
      for (const dataId in studyData) {
        if (itemsToBeDisplayed.includes(dataId)) {
          switch (dataId) {
            case "name":
              control = new qx.ui.form.TextField();
              form.add(control, this.tr("Name"));
              break;
            case "description":
              control = new qx.ui.form.TextField();
              form.add(control, this.tr("Description"));
              break;
            case "notes":
              control = new qx.ui.form.TextArea().set({
                minimalLineHeight: 2
              });
              form.add(control, this.tr("Notes"));
              break;
            case "prjOwner":
              control = new qx.ui.form.TextField();
              form.add(control, this.tr("Owner"));
              break;
            case "collaborators":
              control = new qx.ui.form.TextField();
              form.add(control, this.tr("Collaborators"));
              break;
            case "creationDate":
              control = new qx.ui.form.TextField();
              form.add(control, this.tr("Creation Date"));
              break;
            case "lastChangeDate":
              control = new qx.ui.form.TextField();
              form.add(control, this.tr("Last Change Date"));
              break;
          }
          let value = studyData[dataId];
          if (typeof value === "object") {
            if (value === null) {
              value = "";
            } else {
              value = Object.keys(value).join(", ");
            }
          }
          control.set({
            value: value
          });
          control.setEnabled(itemsToBeModified.includes(dataId));
        }
      }

      let controller = new qx.data.controller.Form(null, form);
      let model = controller.createModel();

      // buttons
      let saveButton = new qx.ui.form.Button(this.tr("Save"));
      saveButton.setMinWidth(70);
      saveButton.setEnabled(!fromTemplate);
      saveButton.addListener("execute", e => {
        for (let i=0; i<itemsToBeModified.length; i++) {
          const key = itemsToBeModified[i];
          let getter = "get" + qx.lang.String.firstUp(key);
          let newVal = model[getter]();
          studyData[key] = newVal;
        }
        let resource = this.__studyResources.project;

        resource.addListenerOnce("putSuccess", ev => {
          this.reloadUserStudies();
        }, this);

        resource.put({
          "project_id": studyData["uuid"]
        }, studyData);

        this.__itemSelected(null);
      }, this);
      form.addButton(saveButton);

      let cancelButton = new qx.ui.form.Button(this.tr("Cancel"));
      cancelButton.setMinWidth(70);
      cancelButton.addListener("execute", e => {
        this.__itemSelected(null);
      }, this);
      form.addButton(cancelButton);

      let deleteButton = new qx.ui.form.Button(this.tr("Delete"));
      deleteButton.setMinWidth(70);
      deleteButton.setEnabled(!fromTemplate);
      deleteButton.addListener("execute", e => {
        let win = this.__createConfirmWindow();
        win.center();
        win.open();
        win.addListener("close", () => {
          if (win["value"] === 1) {
            let resource = this.__studyResources.project;

            resource.addListenerOnce("delSuccess", ev => {
              this.reloadUserStudies();
            }, this);

            resource.del({
              "project_id": studyData["uuid"]
            });

            this.__itemSelected(null);
          }
        }, this);
      }, this);
      form.addButton(deleteButton);

      this.__editStudyLayout.add(new qx.ui.form.renderer.Single(form));
    },

    __createConfirmWindow: function() {
      let win = new qx.ui.window.Window("Confirmation").set({
        layout: new qx.ui.layout.VBox(10),
        width: 300,
        height: 60,
        modal: true,
        showMaximize: false,
        showMinimize: false,
        showClose: false,
        autoDestroy: false
      });

      let text = new qx.ui.basic.Label(this.tr("Are you sure you want to delete the study?"));
      win.add(text);

      let buttons = new qx.ui.container.Composite(new qx.ui.layout.HBox(10, "right"));
      var btnNo = new qx.ui.form.Button("No");
      var btnYes = new qx.ui.form.Button("Yes");
      btnNo.addListener("execute", e => {
        win["value"] = 0;
        win.close(0);
      }, this);
      btnYes.addListener("execute", e => {
        win["value"] = 1;
        win.close(1);
      }, this);
      buttons.add(btnNo);
      buttons.add(btnYes);
      win.add(buttons);

      return win;
    },

    __getStudyArrayModel: function(studyList) {
      let sortByProperty = function(prop) {
        return function(a, b) {
          if (prop === "lastChangeDate") {
            return new Date(b[prop]) - new Date(a[prop]);
          }
          if (typeof a[prop] == "number") {
            return a[prop] - b[prop];
          }
          if (a[prop] < b[prop]) {
            return -1;
          } else if (a[prop] > b[prop]) {
            return 1;
          }
          return 0;
        };
      };
      studyList.sort(sortByProperty("lastChangeDate"));

      let studyArray = new qx.data.Array(
        studyList
          .map(
            (p, i) => qx.data.marshal.Json.createModel({
              name: p.name,
              thumbnail: p.thumbnail,
              uuid: p.uuid,
              lastChangeDate: new Date(p.lastChangeDate),
              prjOwner: p.prjOwner
            })
          )
      );
      return studyArray;
    }
  }
});
