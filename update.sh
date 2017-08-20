#!/bin/bash
# config the version of wellclient
UPDATE_VERSION=v2.7.18.RELEASE

git fetch origin ${UPDATE_VERSION}:${UPDATE_VERSION}
git checkout ${UPDATE_VERSION}