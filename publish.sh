#!/bin/sh

aws s3 sync --region us-east-1 --cache-control max-age=604800 dist s3://bloodynipples.com
