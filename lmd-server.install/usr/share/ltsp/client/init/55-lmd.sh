# This file is part of LTSP, https://ltsp.org
# Copyright 2019 the LTSP team, see AUTHORS
# SPDX-License-Identifier: GPL-3.0-or-later

# Activate swap partitions. Code adapted from casper.
# @LTSP.CONF: LOCAL_SWAP

lmd_main() {
    re local_lmd
}

local_lmd() {
    local devices device magic
    rs mkdir /run/lmd
    rs touch /run/lmd/semi

    echo "SSHFS=0" >> /etc/ltsp/pamltsp.conf
}
