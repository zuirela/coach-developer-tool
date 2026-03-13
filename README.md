# Coach Developer Tool – SJL

Valmentajien osaamisen kehittämiseen tarkoitettu web-sovellus Suomen Jääkiekkoliitolle.

## Ominaisuudet

- **Havainnoinnit** – Havainnointilomakkeiden täyttäminen ja arkistointi kentällä
- **Lomakkeet** – Havainnointilomakkeiden luonti ja hallinnointi
- **Kriteerit** – Havainnointikriteerien hallinta (lajitaidot, vuorovaikutus, suunnittelu)
- **Itsearviointi** – Valmentajan oma 360° itsearviointi
- **Tavoitteet** – Valmentajan henkilökohtaiset kehitystavoitteet
- **Raportit** – Osaamisprofiili, kehittymisgraafi ja yhteenvedot
- **Roolit** – Liitto, seura ja valmentaja -roolit eri käyttöoikeuksilla

## Teknologia

- Puhdas HTML5 / CSS3 / Vanilla JavaScript (ES6+)
- Chart.js (CDN) – kaaviot
- Google Fonts (CDN) – Barlow-fontti
- localStorage – tietojen säilytys selaimessa
- Ei palvelinriippuvuuksia – toimii suoraan staattisena sivuna

## Rakenne

```
coach-developer-tool/
├── index.html          # Pääsivu
├── css/
│   └── styles.css      # Kaikki tyylit (SJL-brändi)
├── js/
│   ├── data.js         # Tietorakenne + localStorage
│   ├── app.js          # SPA-reititys ja pääkontrolleri
│   ├── components/
│   │   ├── modal.js    # Modaali-komponentti
│   │   ├── toast.js    # Toast-ilmoitukset
│   │   └── chart.js    # Chart.js-apufunktiot
│   └── views/
│       ├── dashboard.js
│       ├── observations.js
│       ├── forms.js        # Sisältää myös CriteriaView, SelfAssessView, GoalsView, ReportsView
│       └── ...
├── assets/
│   ├── sjl-logo.jpg
│   └── sjl-tunnus.png
└── README.md
```

## Julkaisu GitHub Pagesin kautta

### 1. Luo GitHub-repositorio

```bash
git init
git add .
git commit -m "Initial commit: Coach Developer Tool"
git branch -M main
git remote add origin https://github.com/KÄYTTÄJÄ/coach-developer-tool.git
git push -u origin main
```

### 2. Aktivoi GitHub Pages

1. Mene repositorion **Settings**-välilehdelle
2. Valitse **Pages** vasemmalta
3. Source: **Deploy from a branch**
4. Branch: **main**, kansio: **/ (root)**
5. Tallenna

Sovellus on muutaman minuutin kuluttua osoitteessa:  
`https://KÄYTTÄJÄ.github.io/coach-developer-tool/`

### Paikallinen kehitys

Avaa `index.html` suoraan selaimessa tai käytä yksinkertaista HTTP-palvelinta:

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .
```

## SJL-brändi

Sovellus noudattaa SJL:n graafista ohjeistoa (v0.9):

| Väri | Nimi | HEX |
|------|------|-----|
| ![](https://via.placeholder.com/12/002E6D/000000?text=+) | Suomen Sininen | `#002E6D` |
| ![](https://via.placeholder.com/12/00ACD7/000000?text=+) | Jää | `#00ACD7` |
| ![](https://via.placeholder.com/12/011D41/000000?text=+) | Ilta | `#011D41` |
| ![](https://via.placeholder.com/12/8B6F4E/000000?text=+) | Kulta '95 | `#8B6F4E` |
| ![](https://via.placeholder.com/12/CFCFCD/000000?text=+) | Betoni | `#CFCFCD` |

Typografia: **Barlow** (web-korvaaja Pepi-fontille)

## HockeyCentre-integraatio (tulevaisuus)

Sovellus on suunniteltu modulaariseksi ja helposti integroitavaksi HockeyCentre-tuotteeseen:

1. `js/data.js` – korvaa localStorage API-kutsulla
2. `js/app.js` – sovita autentikointi HockeyCentren JWT-tokeneihin
3. Views pysyvät muuttumattomina

## Lisenssi

© 2024 Suomen Jääkiekkoliitto (SJL) / Qridi. Kaikki oikeudet pidätetään.
