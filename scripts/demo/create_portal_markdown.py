
""" This script produces a markdown document with links to template studies

    Aims to emulate links

"""
import argparse
import json
import logging
import sys
from datetime import datetime
from pathlib import Path

from simcore_service_webserver.login.registration import (URL,
                                                          get_invitation_url)
from simcore_service_webserver.login.utils import get_random_string
from simcore_service_webserver.resources import resources
from contextlib import contextmanager


CONFIRMATIONS_FILENAME = "confirmations-invitations.csv"

ISSUE = r"https://github.com/ITISFoundation/osparc-simcore/issues/"

HOST_URLS_MAPS = [
    ('localhost', r'http://127.0.0.1:9081'),
    ('master', r'http://master.osparc.io'),
    ('staging', r'https://staging.osparc.io'),
    ('production', r'https://osparc.io')
]

MOCK_CODES = [
    "AOuAejUGDv34i9QtxYK61V7GZmCE4B",
    "uQhnK20tuXWdleIRhZaBcmrWaIrb2p",
    "weedI0YvR6tMA7XEpaxgJZT2Z8SCUy",
    "Q9m5C98ALYZDr1BjilkaaXWSMKxU21",
    "jvhSQfoAAfin4htKgvvRYi3pkYdPhM"
]

current_path = Path( sys.argv[0] if __name__ == "__main__" else __file__).resolve()
logging.basicConfig(level=logging.INFO)

log = logging.getLogger(__name__)


@contextmanager
def _open(filepath):
    filepath = Path(filepath)

    log.info("Writing %s ... ", filepath)
    with open(filepath, "wt") as fh:
        yield fh
    log.info("%s ready", filepath.name)


def write_list(hostname, url, data, fh):
    print("## studies available @{}".format(hostname), file=fh)
    print("", file=fh)
    for prj in data:
        print("- [{name}]({base_url}/study/{uuid})".format(base_url=url, **prj), file=fh)
    print("", file=fh)


def main(mock_codes):

    with resources.stream('data/fake-template-projects.isan.json') as fp:
        data = json.load(fp)

    file_path = str(current_path.with_suffix(".md")).replace("create_", "")
    with _open(file_path) as fh:
        print("<!-- Generated by {} on {} -->".format(current_path.name, datetime.utcnow()), file=fh)
        print("# THE PORTAL Emulator\n", file=fh)
        print("This pages is for testing purposes for issue [#{1}]({0}{1})\n".format(ISSUE, 715), file=fh)
        for hostname, url in HOST_URLS_MAPS:
            write_list(hostname, url, data, fh)

        print("---", file=fh)

        print("# INVITATIONS Samples:", file=fh)
        for hostname, url in HOST_URLS_MAPS[:-1]:
            # invitations for production are not openly published
            print("## urls for @{}".format(hostname), file=fh)
            for code in mock_codes:
                print("- [{code}]({base_url})".format(
                    base_url=get_invitation_url({'code':code, 'action':"INVITATION"}, URL(url)),
                    code=code),
                file=fh)

        print("", file=fh)


    file_path = current_path.parent / CONFIRMATIONS_FILENAME
    with _open(file_path) as fh:
        print("code,user_id,action,data,created_at", file=fh)
        for code in mock_codes:
            print('%s,1,INVITATION,"{' % code, file=fh)
            print('""guest"": ""inviteed@foo.com"" ,', file=fh)
            print('""host"" : ""inviter@osparc.io""', file=fh)
            print('}",%s' % datetime.now().isoformat(sep=" "), file=fh)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generates some material for demos')
    parser.add_argument("--renew-invitation-codes", "-c", action="store_true",
                        help="Regenerates codes for invitations")

    args = parser.parse_args()

    codes = MOCK_CODES
    if args.renew_invitation_codes:
        codes =[ get_random_string(30) for _ in MOCK_CODES]

    main(codes)