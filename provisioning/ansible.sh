#!/bin/bash

if ! [`which ansible`]; then
  sudo apt-get update
  sudo apt-get install -y software-properties-common
  sudo apt-add-repository ppa:ansible/ansible
  sudo apt-get update
  sudo apt-get install -y ansible
fi

ansible-playbook -vv -i localhost, -c local /vagrant/provisioning/playbook.yml