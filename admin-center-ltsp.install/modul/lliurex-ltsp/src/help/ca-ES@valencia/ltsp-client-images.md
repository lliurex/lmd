
# Gestió d'imatges a LliureX LTSP
___
###### Ajuda a la wiki de LliureX
* <a href="http://wiki.lliurex.net/Crear%20client" target="_blank">Creació d'imatges a LliureX 15</a>
* <a href="http://wiki.lliurex.net/Tipus%20de%20clients" target="_blank">Tipus de clients: Lleugers, semilleugers o pesats</a>
___

En aquesta finestra es mostran les imatges per als clients lleugers que tenim configurades.

Una imatge de client lleuger és un sistema LliureX complet, creat dins una carpeta del servidor i comprimit de manera que puga ser distribuït als clients que s'hi connecten.

Així doncs, podem tindre tants tipus d'imatges diferents com sabors de LliureX. A l'hora d'arrancar el client, es donarà la possibilitat de triar entre les diferents imatges existents.

## Creació d'imatges

Per tal de crear una nova imatge, no haureu de fer més que clic al botó de crear una nova imatge de client, i s'iniciarà un assistent pas a pas al qual crear la imatge. Els diferents passos de l'assistent són:

1. Selecció del sabor de LliureX (client d'aula, escriptori o infantil), així com la seua arquitectura (32 o 64 bits).
2. Donar-li un nom i una descripció a la imatge. Podem utilitzar els que venen per omissió o triar-ne uns altres.
3. Quan fem clic a Crear, començarà la descàrrega del programari de base i específic per al sabor que hem triat i la instal·lació del client al directori. **Tingueu en compte que aquest és un procés relativament lent, ja que ha de descarregar tot un sistema complet, instal·lar-lo i configurar-lo. Tingueu paciència!**

Una vegada creada la imatge, aquesta apareixerà a la llista d'imatges que es mostren en esta finestra.

## Operacions sobre una imatge

Sobre les imatges ja creades podem realitzar diferents operacions:

* **Configurar les opcions de la imatge**: Ens permetrà realitzar una configuració específica i avançada de la imatge. Podem modificar el seu nom o la descripció; el tipus de client que serà (valor per omissió, lleuger o semilleuger); idioma de la pantalla d'inici; l'umbral de RAM als clients, per davall del qual es comportaran sempre com a clients lleugers; l'ús de "Local Apps", que permet utilitzar aplicacions de la imatge de client, com els navegadors web, en una configuració de client lleuger, evitant utilitzar la instal·lació del propi servidor. Al quadre de text d'opcions avançades podem utilitzar diverses opcions d'arrancada de caràcter avançat. Podem trobar aquestes opcions d'arrencada <a href="http://manpages.ubuntu.com/manpages/trusty/man5/lts.conf.5.html" target="_blank">al següent enllaç</a>
* **Editar la imatge**: Ens obrirà una nova finestra del navegador amb un entorn d'escriptori lleuger (Awesome/JWM) sobre el sistema que conté la imatge. Amb açò podrem actualitzar-la o instal·lar programari nou. Recordeu que després d'una modificació de la imatge, cal que regenerem aquesta per prepar-la per poder veure els canvis als clients.
* **Clonar la imatge**: Ens permet obtenir una altra còpia del sistema en qüestió, bé per poder tindre una imatge personalitzada independent o bé per distribuïr-la a altres equips. Les imatges exportades apareixeran a l'apartat corresponent del menú (Imatges Exportades).
* **Esborrar la imatge**: Amb la qual cosa, la imatge ja no estará a la llista, ni disponible per als usuaris. 


