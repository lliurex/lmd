# Ajuda d'LTSP

___
###### Ajuda a la wiki de LliureX
* <a href="http://wiki.lliurex.net/tiki-index.php?page=LMD_va" target="_blank">Introducció a LTSP la wiki de LliureX</a>
* <a href="http://wiki.lliurex.net/tiki-index.php?page=Tipus+de+clients" target="_blank">clients lleugers, semilleugers o pesats, a la wiki de LliureX</a>
___



LliureX utilitza LTSP per tal d'establir un entorn de clients lleugers. Aquests clients lleugers no són més que ordinadors de poca potència -sovint sense disc dur- que fan possible que diversos usuaris accedisquen a un sistema LliureX ubuicat al servidor. Açò fa possible el recliclatge d'ordinadors obsolets, així com el funcionament amb ordinadors moderns de poca potència però molt econòmics, i amb un consum elèctric molt reduït.


## Funcionalitats de LliureX LTSP
 
LliureX LTSP permet:

* **Crear i personalitzar imatges**: En un servidor amb una rèplica local dels repositoris de LliureX (mirror), es poden generar imatges de clients de qualsevol sabor de LliureX, així com actualitzar-les i personalitzar-ne el programari i la configuració.
* **Client lleuger mínim**: Si no disposem d'un mirror de LliureX, tenim la possibilitat d'utilitzar una imatge de sistema d'uns 300mb ja construïda, i que ens servirà per arrancar els clients i accedir a travès d'ells al servidor (client lleuger).
* **Ús de Clients Raspberry Pi:** LliureX LTSP permet utilitzar una imatge de client lleuger per a dispositius de tipus Raspberry Pi.

## Requisits

Segons la documentació del projecte LTSP i d'Ubuntu, els requisits mínims en el servidor són:

* Core 2 Duo o Core 2 Quad (també funciona amb CPU més simples però amb menor rendiment)
* 4 GB (20 clients); recomanable 8 GB (depén de la demanda dels usuaris)
* 1 targeta de xarxa a Gigabit (mínim) 

En el client:

* Pentium Pro o superior
* 128 MB de RAM
* Targeta de xarxa Fast Ethernet amb suport PXE