#!/bin/bash
curl -LO https://openresty.org/download/openresty-1.27.1.1.tar.gz;
tar -xvf openresty-1.27.1.1.tar.gz;
cd openresty-1.27.1.1/;
./configure -j2;
make -j2;
sudo make install;
sudo mkdir /srv/nginx;
sudo chown `whoami` /srv/nginx;
sudo chmod a+r /srv/nginx;
cd ..;
rm openresty-1.27.1.1.tar.gz;
rm -r openresty-1.27.1.1;
mv -vn * /srv/nginx/;
printf "You can add this to your bashrc:\n  alias ngx='cd /srv/nginx; sh srv.sh'\n";
