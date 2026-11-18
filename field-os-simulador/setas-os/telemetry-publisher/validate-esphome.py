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
        # Control firmware of CLOUDLAB 844 (repo root), which includes this
        # package. Test-only setpoints: the real ones come from the room cycle
        # (room-node-setpoints.js). Without them the firmware must NOT validate.
        repo = source.parents[2]
        control = directory / 'control'
        (control / 'esphome').mkdir(parents=True)
        nested = control / 'field-os-simulador' / 'setas-os' / 'telemetry-publisher'
        nested.mkdir(parents=True)
        shutil.copy2(repo / 'cloudlab_esp32.yaml', control / 'cloudlab_esp32.yaml')
        shutil.copy2(repo / 'esphome' / 'modulo-fructificacion.package.yaml', control / 'esphome')
        for profile in source.glob('*.yaml'):
            shutil.copy2(profile, nested / profile.name)
        (control / 'secrets.yaml').write_text(
            'wifi_ssid: validation-only\n'
            'wifi_password: validation-password-not-production\n'
            'ap_password: validation-ap-not-production\n'
            f'api_encryption_key: {test_key}\n'
            'ota_password: validation-ota-not-production\n'
            'setas_publisher_url: https://publisher.invalid:8443/api/telemetry\n'
            'setas_publisher_authorization: Bearer validation-only-token-not-production-00000000\n',
            encoding='utf-8',
        )
        test_only = ['-s', 'heat_setpoint_c', '18.5', '-s', 'histeresis_c', '0.5', '-s', 'temp_max_c', '24.0', '-s', 'consigna_id', 'validation-only']
        target = str(control / 'cloudlab_esp32.yaml')
        unset = subprocess.run([executable, 'config', target], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False)
        print(f'cloudlab-control: config without setpoints {"REJECTED (expected)" if unset.returncode else "ACCEPTED (unexpected)"}', flush=True)
        if unset.returncode == 0:
            failures.append('cloudlab-control:placeholders')
        for action in (('config', 'compile') if args.compile else ('config',)):
            result = subprocess.run([executable, *test_only, action, target], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False)
            passed = result.returncode == 0
            print(f'cloudlab-control: {action} {"PASS" if passed else "FAIL"}', flush=True)
            if not passed:
                failures.append(f'cloudlab-control:{action}')
                break
        return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
