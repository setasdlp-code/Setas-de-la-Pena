#!/usr/bin/env python3
"""Validate copies of node profiles using synthetic secrets; never flash a device."""
import argparse
import base64
import os
from pathlib import Path
import shutil
import subprocess
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--esphome', required=True, help='Path to an existing ESPHome executable')
    parser.add_argument('--compile', action='store_true', help='Also build firmware; may download the ESP32 toolchain')
    args = parser.parse_args()
    executable = shutil.which(args.esphome)
    if not executable:
        parser.error('ESPHome executable not found; this script does not install dependencies')
    source = Path(__file__).resolve().parent
    with tempfile.TemporaryDirectory(prefix='setas-esphome-check-') as scratch:
        directory = Path(scratch)
        for profile in source.glob('*.yaml'):
            shutil.copy2(profile, directory / profile.name)
        # Public, deterministic validation data, never production credentials.
        test_key = base64.b64encode(bytes(range(1, 33))).decode('ascii')
        (directory / 'secrets.yaml').write_text(
            'wifi_ssid: validation-only\n'
            'wifi_password: validation-password-not-production\n'
            f'setas_api_key: {test_key}\n'
            'ota_password: validation-ota-not-production\n'
            'setas_publisher_url: https://publisher.invalid:8443/api/telemetry\n'
            'setas_publisher_authorization: Bearer validation-only-token-not-production-00000000\n',
            encoding='utf-8',
        )
        failures = []
        for node in ('martha', 'cloudlab', 'incubacion'):
            for action in (('config', 'compile') if args.compile else ('config',)):
                command = [executable, action, str(directory / f'esphome-{node}.yaml')]
                # Config output can contain credentials in general. Only a
                # summary reaches stdout, even though these secrets are fake.
                result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=os.environ.copy(), check=False)
                passed = result.returncode == 0
                print(f'{node}: {action} {"PASS" if passed else "FAIL"}', flush=True)
                if not passed:
                    failures.append(f'{node}:{action}')
                    break
        return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
