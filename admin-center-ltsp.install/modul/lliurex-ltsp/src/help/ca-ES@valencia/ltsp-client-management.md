# Gestió de clients

En aquest finestra es mostren els ordinadors de l'aula per tal de poder configurar les seues opcions d'arrancada.

## Tipus de clients detectats

Els clients poden tindre o no una configuració específica d'arrancada. Això es mostrarà amb el color de fons de cada client:

* **Clients marcats amb fons gris**: Són els clients que hi ha connectats actualment a l'aula i per als quals no es disposa de configuració específica.
* **Clients marcats amb fons verd**: Són els clients que hi ha connectats actualment a l'aula i per als quals hi ha una configuració específica.
* **Clients marcats amb fons roig**: Són els clients per als quals es té una configuració feta, però que en estos moments no es troben connectats.

Davall de cada icona que representa un client trobem dos cadenes de text. La primera mostra l'adreça MAC del client. Això no és més que una xifra que identifica la targeta de xarxa a través de la qual es connecta el client, i que serveix per identificar aquest de forma unívoca. La segona cadena que apareix, indica l'adreça IP del client dins la nostra xarxa (per identificar-lo localment), si aquest es troba connectat, o en cas contrari, la cadena "Desconnectat".

## Opcions per als clients

Als clients podem configurar diversos paràmetres:

* **Autologin**: Si aquesta opció està activada, i els camps nom d'usuari d'autologin i contrassenya estan establerts, ens servix per arrancar automàticament la sessió d'aquest usuari en el client, sense necessitat de passar per la finestra d'inici.
* **Força l'arrancada com a client lleuger**: Si s'activa forçarà que el client s'utilitze com a client lleuger, encara que la resta de l'aula estiga configurada per a executar-se com a client semilleuger.
* **Opcions extra**: Permet configurar moltes altres opcions avançades en mode text. Podem trobar les diferents opcions d'arrancada <a href="http://manpages.ubuntu.com/manpages/trusty/man5/lts.conf.5.html" target="_blank">al següent enllaç</a>
