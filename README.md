# 📈 StockSim Mobile

**StockSim Mobile** ist eine vollwertige mobile App für **Lehrer und Schüler**, um den **Börsenhandel realitätsnah zu simulieren**.  
Schüler lernen spielerisch, wie Märkte funktionieren – Lehrer verwalten Schüler, verteilen Kapital und beobachten deren Fortschritt.

Die App ist der mobile Client für das **StockSim-Backend (Flask API)** und wurde mit **React Native / Expo** entwickelt.

---

## 🚀 Funktionen

### 👨‍🎓 Schüler-Interface
- **Login mit Lehrerkennung**  
  Jeder Schüler gehört zu einem Lehrer und kann sich nur über dessen Benutzername einloggen.
- **Virtuelles Trading-System**  
  Kaufen und Verkaufen von Aktien zu Live-Preisen (bzw. simulierten Kursen über die API).
- **Portfolio-Ansicht**  
  Zeigt alle gehaltenen Aktien, aktuelle Werte, Einstandspreise und Gewinne/Verluste.
- **Portfolio-Historie**  
  Visualisiert den Verlauf des Gesamtvermögens über die Zeit mit Diagrammen.
- **Live-Dashboard**  
  Übersicht über verfügbares Kapital, investiertes Kapital und aktuelle Performance.

### 👩‍🏫 Lehrer-Interface
- **Login für Lehrer oder Administratoren**  
  Zugriff auf alle eigenen Schüler.
- **Schülerverwaltung**  
  - Schüler hinzufügen (mit Startkapital)  
  - Schüler löschen  
  - Passwort ändern  
  - Guthaben aufladen
- **Einblicke in Schüler-Portfolios**  
  Lehrer können die Bestände und Performance jedes Schülers in Echtzeit einsehen.

---

## ⚙️ Technische Übersicht

| Komponente | Beschreibung |
|-------------|--------------|
| **Frontend** | React Native (Expo) |
| **API** | Flask + SQLAlchemy |
| **State Management** | React Hooks & Context |
| **Datenpersistenz** | SecureStore für Tokens |
| **Charts** | Gifted Charts |
| **Auth** | JWT-basierte Authentifizierung |
| **Design** | Dark Mode mit grünen Akzenten (Finanz-Look) |

---

## 🧠 Setup & Entwicklung

### 1. Repository klonen
```bash
git clone https://github.com/<deinname>/stocksim-mobile.git
cd stocksim-mobile
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. App starten (lokal)

```bash
expo start
```

Du kannst dann:
- mit dem Expo Go App-Scanner (QR-Code) testen, oder
- mit einem Android-Emulator oder physischem Gerät starten.




