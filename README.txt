Housekeeping Manager v0.2

Local: cd housekeeping_app && python3 -m http.server 8080; apoi http://localhost:8080
Pentru iPhone: publicați printr-un serviciu HTTPS compatibil cu PWA.

Nou: tarif configurabil pe cameră finalizată, cu/fără checker; ore Houseman; detaliu facturare CSV; evidență lenjerie.

ATENȚIE: Aceste calcule sunt un model nou, NU au fost validate față de formulele originale Alfa Abrechnung. Folosiți facturarea oficială din Excel până la reconciliere.
Datele sunt locale în browser. Backup JSON regulat; nu există sincronizare, login sau backend.


v0.3: verificari de consistenta pentru camere, facturare lunara estimativa si export CSV. Datele raman in localStorage, fara sincronizare. NU folositi totalurile ca facturi oficiale pana la validarea fata de Excel.

v0.4: aplicație individuală, navigare între zile, plan zilnic pentru tipărire, backup validat și estimare de facturare mai strictă. Camerele fără serviciu explicit sunt excluse din facturare. Datele nu se sincronizează între dispozitive. Atenție: aplicația NU este încă echivalentă cu Excel-ul original.


v0.5: tarife separate pe Checkout/Stayover/Extra, cu/fara checker; reconciliere lunara si export CSV. Tarifele sunt estimative, NU validate fata de formulele originale Alfa. Backup v0.5 include matricea de tarife.

VERSIUNEA 0.6: tab Diskrepanz; introducere manuală cifre OPERA Checkout/Stayover/OOO, comparație zilnică și export CSV lunar. Referințele sunt salvate în backup-ul existent. Nu este echivalentul formulelor din Excel.

Versiunea 0.7: modul Rating & Performance cu procente și observații lunare introduse manual, comparație în puncte procentuale, export CSV. Datele sunt incluse în backupul JSON existent. Ratingurile NU sunt importate automat și nu există paritate validată cu formulele Excel.

Versiunea 0.8: Excel-Abgleich compară totaluri zilnice confirmate manual cu estimarea curentă; referințele sunt stocate în state și intră în backup JSON. Nu reproduce formulele originale.

v0.9: Prüfprotokoll cu snapshot al tarifelor, camerelor și orelor Houseman la momentul verificării. Export CSV; backup JSON conține snapshots. Service worker actualizat pentru toate modulele v03–v09. Nu reprezintă validarea formulelor originale.

VERSIUNEA 1.0: Modul de comparare pe poziții (Excel-Abgleich). Importă CSV cu antet Data;Camera;Serviciu;SumaEUR, cu separator ;. Se compară cu pozițiile din jurnalul fixat. Nu este import automat al formulelor Excel. Faceți backup înainte de import.

VERSIUNEA 1.2: Reconciliere zilnică per cleaner cu referințe CSV confirmate din Excel. Totalurile aplicației rămân estimative; nu reproduce formulele originale. Referințele sunt incluse în backup v1.2.
