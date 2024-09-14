#!/bin/sh

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
docker run -it \
  -v ${SCRIPT_DIR}/config.vdf:/home/steam/Steam/config/config.vdf \
  -v ${SCRIPT_DIR}/../:/home/steam/Sketches \
  steamcommando ./steamcmd.sh \
  +login $1 \
  +run_app_build /home/steam/Sketches/steam/app_build_$2.vdf +quit
