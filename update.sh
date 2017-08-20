#!/bin/bash
# config the version of wellclient
UPDATE_VERSION=v2.8.20.RELEASE

git fetch origin ${UPDATE_VERSION}:${UPDATE_VERSION}
git ci -am "update the wellclient version"
git checkout ${UPDATE_VERSION}