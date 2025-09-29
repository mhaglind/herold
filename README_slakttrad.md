# Herold - Family Tree Web Application

**Note: This project has evolved from a manual family tree for the Halling family to a full web application for creating and managing family trees through AI-powered natural language processing.**

## Original Halling Family Data

The Halling family tree data in this directory serves as:
1. **Reference Implementation**: Example of complex family relationships
2. **Test Data**: For validating the automated layout algorithms
3. **Migration Source**: Template for converting to the new web application format

For the complete web application implementation plan, see `HEROLD_IMPLEMENTATION_PLAN.md`.

## Filer

- `halling_slakt.json` - Strukturerad databas med alla släktrelationer
- `halling_slakttrad.svg` - Visuell representation av släktträdet (A4-format)
- `README_slakttrad.md` - Denna dokumentation

## JSON-struktur

### Personer
Varje person har följande fält:
- `id` - Unikt ID (används för referenser)
- `namn` - Fullständigt namn (inkl. hus/geografisk tillhörighet)
- `kön` - "man" eller "kvinna"
- `generation` - Generationsnummer (negativa för äldre, decimaler för mellangenerationer)
- `föräldrar` - Array med ID:n för föräldrar (båda om kända)
- `partner` - ID för nuvarande partner/make
- `barn` - Array med ID:n för barn
- `status` - "levande", "död", "okänd"
- `anteckningar` - Fritext för rollspelsinformation och kulturell bakgrund

### Relationer
- `äktenskap` - Lista över alla äktenskap/partnerskap
- `syskon` - Lista över syskonrelationer (för tydlighet)

### Generation-system
- Negativa siffror för äldre generationer (ex: -4, -3, -2, -1)
- Decimaler för mellangenerationer (ex: -1.5, -0.5)
- Positiva siffror för yngre generationer (ex: 0, 1, 2, 3)

## Nuvarande familj (uppdaterad)

**Generation -4:** Galrandir

**Generation -3:** Halli av Dal ⚭ Elanor

**Generation -2:** Arnhelm ⚭ Rosanna Heather, Aldred Heather från Bri

**Generation -1.5:** Grimward ⚭ Mithrellas, Aldanor av huset Dúnhere

**Generation -1:** Beregond

**Generation -0.5:** Hafgrim

**Generation 0:** Vidar ⚭ Liriel av huset Ulad, Eliv ⚭ Astrid, Ulduilas av huset Ulad

**Generation 1:** Holmfast ⚭ Tyra, Sigeberth, Tormund, Ulf

**Generation 2:** Halvard Halling ⚭ Aelswith, Godmer, Steinþór av Elivs Ryd

**Generation 3:** Harald, Halldis, Frode, Steorra

## Kulturella namngivningsprinciper

### Fornnordiska namn (Dal-traditionen)
- Används för: Halli, Arnhelm, Grimward, Hafgrim, Holmfast, Eliv, Tormund, Ulf, Steinþór
- Kännetecken: Kraftfulla, naturanknutna, ofta gudsrelaterade

### Sindarin namn (Dunedain/älvisk påverkan)
- Används för: Galrandir, Elanor, Liriel, Ulduilas, Beregond, Mithrellas
- Visar ädel börd och kulturell koppling till älvornas traditioner

### Engelska namn (Bri-folk)
- Används för: Rosanna Heather, Aldred Heather
- Praktiska bondenames från Bri-regionen

### Ätta-namn och geografiska kopplingar
- Huset Dúnhere (Dunedain)
- Huset Ulad (sindarin/älvisk)
- "av Elivs Ryd" - geografisk markering av territoriell kontroll

## KRITISKA SYNKRONISERINGSREGLER

**ALLTID följa denna ordning när du lägger till nya personer:**

1. **JSON FÖRST**: Lägg till alla nya personer, uppdatera alla relationer
2. **Kontrollera ID-referenser**: Säkerställ att alla `föräldrar`, `barn`, `partner` har korrekta ID:n
3. **Uppdatera relationer**: Lägg till i `äktenskap` och `syskon` sektionerna
4. **SVG DÄREFTER**: Uppdatera visuell representation
5. **Testa alla kopplingar**: Kontrollera att linjer går till rätt personer

### JSON-synkronisering checklist:
- [ ] Ny person tillagd i `personer`
- [ ] `föräldrar` uppdaterade för nya personen
- [ ] `barn` uppdaterade för föräldrar
- [ ] `partner` uppdaterade för makar
- [ ] Äktenskap tillagt i `relationer.äktenskap`
- [ ] Syskonrelationer tillagda om relevanta
- [ ] `metadata.senast_uppdaterad` uppdaterad

## SVG-hantering och layout

### Format och stil
- **Format**: A4 stående (595x842 px)
- **Typsnitt**: Times New Roman för elegans
- **Linjer**: `stroke-width="1"` för subtilhet
- **Färger**: `#5a4a3a` för text, `#8b7355` för linjer

### Layout-principer
- Äktenskapslinjer ska vara horisontella med ⚭-symbol
- Barn-linjer ska utgå från mitten av äktenskapslinjen
- Syskonrelationer visas med streckade linjer (`stroke-dasharray="2,2"`)
- Textstorlek måste justeras när fler personer läggs till

### Positionering
- Centrering är kritisk - linjer måste hamna mitt på namnen
- Använd `text-anchor="middle"` för all text
- Beräkna positioner noggrant när layout ändras
- Testa att alla linjer når rätt personer

### Trånghetsproblem
När många personer läggs till:
1. Minska fontstorlek gradvis (18px → 16px → 14px → 12px)
2. Komprimera horisontellt utrymme
3. Justera alla relaterade x-koordinater
4. Kontrollera att text inte överlappar

## Workflow för att lägga till nya personer

### 1. Planering
- Använd TodoWrite för att hålla koll på flera steg
- Bestäm kulturell bakgrund och namngivning
- Identifiera alla relationer som påverkas

### 2. JSON-uppdatering
```json
// Lägg till ny person
"nytt_id": {
  "id": "nytt_id",
  "namn": "Nytt Namn med rätt kulturell stil",
  "kön": "man/kvinna",
  "generation": X,
  "föräldrar": ["förälder1_id", "förälder2_id"],
  "partner": "partner_id_eller_null",
  "barn": ["barn1_id", "barn2_id"],
  "status": "levande",
  "anteckningar": "Kulturell bakgrund och rollspelsinformation"
}
```

### 3. Uppdatera alla relationer
- Föräldrar: lägg till i deras `barn` array
- Partner: uppdatera deras `partner` fält
- Barn: lägg till i deras `föräldrar` array
- Lägg till i `relationer` sektionen

### 4. SVG-uppdatering
- Beräkna ny position baserat på generation och ordning
- Lägg till text-element
- Lägg till alla nödvändiga linjer
- Justera befintliga positioner om nödvändigt
- Testa att alla linjer hamnar rätt

## Layout-algoritm och systematik

### Robust familjeträds-layout: 3-stegs metodik

#### Steg 1: Analys av relationsproblem
När diagrammet har layoutproblem, utför systematisk analys:

1. **Identifiera familjegrupper**: Gruppera personer efter gemensamma föräldrar
2. **Upptäck missvisande linjer**: Leta efter linjer som antyder fel relationer
3. **Hitta text-kollisioner**: Kontrollera överlappande etiketter
4. **Verifiera linjepositioner**: Mät avstånd mellan linjer och deras måltext

#### Steg 2: Design av familjegrupp-struktur
Använd **separerade familjegrupper** istället för globala linjer:

```
DÅLIGT (global linje):
Förälder1 ⚭ Förälder2    Förälder3 ⚭ Förälder4
    |            \           /            |
    +-------------+-----+---+-------------+
                  |     |   |             |
              Barn1   Barn2 Barn3       Barn4

BÄTTRE (familjegrupper):
Förälder1 ⚭ Förälder2    Förälder3 ⚭ Förälder4
         |                        |
    +---------+              +---------+
    |         |              |         |
  Barn1     Barn2          Barn3     Barn4
```

#### Steg 3: Matematisk linjeberäkning
För varje familjegrupp:

1. **Föräldracentrum**: `centrum_x = (förälder1_x + förälder2_x) / 2`
2. **Barncentrum**: `centrum_x = (första_barn_x + sista_barn_x) / 2`
3. **Vertikal koppling**: Föräldracentrum → Barncentrum
4. **Horisontell syskonlinje**: Endast mellan barn från samma föräldrar
5. **Y-separation**: Minimum 15-20px mellan etiketter på samma höjd

### Layout-algoritm för komplexa familjer

#### A. Identifiera familjestrukturer från JSON
```python
# Pseudokod för analys
for person in generation:
    if person.föräldrar:
        familjegrupp = group_by_parents(person.föräldrar)
        familjegrupper.append(familjegrupp)
```

#### B. Beräkna optimala positioner
```python
# Familjegrupp-centrering
def calculate_family_center(family_group):
    parent_center = (parent1.x + parent2.x) / 2
    children_center = (first_child.x + last_child.x) / 2
    return parent_center, children_center
```

#### C. Rita linjer systematiskt
```python
# Linje-routing per familj
def draw_family_lines(family):
    parent_center_x, children_center_x = calculate_family_center(family)

    # Vertikal förälder→barn
    draw_line(parent_center_x, parent_y, parent_center_x, junction_y)
    draw_line(parent_center_x, junction_y, children_center_x, junction_y)

    # Horisontell syskonlinje
    draw_line(first_child.x, child_y, last_child.x, child_y)

    # Vertikala barn-kopplingar
    for child in family.children:
        draw_line(child.x, child_y, child.x, junction_y)
```

## Vanliga fallgropar och lösningar

### Problem: Familjer ser ut som syskon
**Diagnos**: Global horisontell linje förbinder alla barn i generation
**Lösning**: Använd separata syskonlinjer per familjegrupp (se algoritm ovan)

### Problem: Linjer hamnar fel
**Diagnos**: Linje-x-koordinater matchar inte text-positioner
**Lösning**: Beräkna centrum matematiskt: `centrum_x = (start_x + slut_x) / 2`

### Problem: Text-kollisioner
**Diagnos**: Etiketter på samma y-koordinat överlappar
**Lösning**: Skikta y-positioner med minimum 15-20px mellanrum

### Problem: JSON och SVG är ur synk
**Lösning**: Använd alltid TodoWrite och gör JSON först, SVG sen

### Problem: ID-referenser stämmer inte
**Lösning**: Sök igenom hela JSON-filen efter gamla ID:n när du byter namn

### Problem: Texten blir för liten/stor
**Lösning**: Justera fontstorlek baserat på antal personer per generation

### Problem: A4-formatet blir för trångt
**Lösning**: Överväg att dela upp trädet eller använda mindre text

## Framtida utbyggnad

Strukturen stöder:
- Obegränsat antal generationer (upp och ner)
- Komplexa familjerelationer med flera kulturer
- Dödsfall och statusändringar
- Rollspelsanteckningar för varje person
- Datum för viktiga händelser
- Geografiska kopplingar och territoriell kontroll

## Best Practices

1. **Håll kulturell konsistens** - respektera namngivningstraditioner
2. **Dokumentera motiveringar** - använd `anteckningar` fältet väl
3. **Testa visuellt** - öppna SVG-filen för att kontrollera layout
4. **Backup** - spara kopior innan stora ändringar
5. **Inkrementella ändringar** - lägg till en person i taget
6. **Validera relationer** - dubbelkolla att alla referenser stämmer

## Tekniska detaljer

- JSON använder UTF-8 för att hantera specialtecken (þ, ð, etc.)
- SVG stödjer Unicode för fornnordiska tecken
- Generationssystemet kan utökas obegränsat i båda riktningar
- Metadata spårar versioner och uppdateringar automatiskt