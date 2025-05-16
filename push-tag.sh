#!/bin/sh
tag=$1
# if the tag doesn't start with v, add it
if [ "$tag" != v* ]; then
    tag="v$tag"
fi
# make sure the tag is formatted correctly (vx.x.x)
if ! [[ "$tag" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Tag must be formatted as vx.x.x"
    exit 1
fi

git tag $tag
git push origin tag $tag