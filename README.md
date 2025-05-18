# Mudraa Invest

Mudraa Invest is a mobile application offering zero-brokerage stock trading for users in the Indian market. It is designed for both novice and experienced traders, providing a seamless and intuitive trading experience.

---

## Objective

The primary objectives of the Mudraa project are:

1. Develop a mobile application offering zero-brokerage stock trading for users in the Indian market.
2. Design an intuitive and user-friendly interface suitable for both novice and experienced traders.
3. Integrate comprehensive, real-time stock market data, including search history and analysis tools.

---

## Scope of the Project

The scope of the Mudraa project encompasses the development of a mobile trading application focused on the Indian equity market.

**Inclusions:**
- Zero-brokerage trading facilities for stocks listed on the NSE and BSE.
- Key features: user account management, real-time stock data display, stock search (with history), order placement (buy/sell), and portfolio tracking.

**Exclusions:**
- No trading in Mutual Funds, F&O, Commodities, or Currencies in current version.
- IPO application functionality is not included.
- Advanced order types and margin trading are not implemented.

---

## Financial Data API

Access to reliable and timely financial data is crucial. For this project, we adopted a multi-source strategy:

1. **Smart API (Angel One):**  
   Fetches real-time data for major Indian indices (NIFTY 50, SENSEX). A dummy service is available for development.
2. **Yahoo Finance (`yfinance`):**  
   Primary source for historical data, charts, and detailed stock quotes.
3. **RapidAPI:**  
   Used for broad real-time data, stock search, market-wide lists, company profiles, and financial statements.
4. **Finnhub:**  
   Integrated for relevant financial news.

This multi-API approach covers diverse data needs and manages budget constraints by leveraging free or developer-friendly tiers.

---

## Tools and Technologies Used

### Frontend
- **React Native (v0.78.0):** Cross-platform mobile app.
- **TypeScript:** Type-safe JavaScript.
- **React Navigation (v7):** App navigation/routing.
- **Axios:** HTTP client.
- **React Native Paper:** UI component library.
- **React Native Chart Kit:** Charts and data visualization.
- **React Native Linear Gradient:** Gradient UI effects.
- **AsyncStorage:** Local data storage.

### Backend
- **Python:** For data processing, analysis tasks, and (if needed) custom backend services.
- **Firebase:** NoSQL database for flexibility and scalability. Used for authentication and data storage.
- **JWT:** Token-based authentication.
- **RESTful API Design:** Communication between frontend and backend.

### Development Tools
- **npm/yarn:** Dependency management.
- **ESLint:** Code quality.
- **Jest:** Testing framework.
- **Git:** Version control.
- **GitHub/GitLab:** Hosting platforms.

---

## App Screenshots

Below are sample screens from Mudraa Invest.  
**Note:** Please upload screenshots to the `screenshots/` directory and update the links below.

```
![Home Screen](screenshots/home.png)
![Login Screen](screenshots/login.png)
![Hot News](screenshots/news.png)
![Wallet & Portfolio](screenshots/wallet.png)
```

---

## Getting Started

> **Note**: Complete [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) before proceeding.

### 1. Clone the Repository & Install Dependencies

```sh
git clone https://github.com/DeepakGoel747/mudraa.git
cd mudraa
npm install
# or
yarn install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in API keys/secrets as needed.  
**Do NOT commit sensitive credentials.**

### 3. Start Metro Dev Server

```sh
npx react-native start
# or
yarn start
```

### 4. Build and Run the App

#### Android

```sh
npx react-native run-android
# or
yarn android
```

#### iOS

Install CocoaPods dependencies (first time only or after updating native deps):

```sh
bundle install
bundle exec pod install
npx react-native run-ios
# or
yarn ios
```

### 5. Modify Your App

Open `App.tsx` in your editor, make changes, and save. The app will auto-update using Fast Refresh.

---

## Troubleshooting

- See the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting).
- For more help, open an issue or contact the maintainer.

---

## Learn More

- [React Native Website](https://reactnative.dev/)
- [Learn the Basics](https://reactnative.dev/docs/tutorial)
- [Blog](https://reactnative.dev/blog/)
- [@facebook/react-native](https://github.com/facebook/react-native)

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Security

If you discover a security vulnerability, please see [SECURITY.md](SECURITY.md) for reporting instructions.

---

## Code of Conduct

Please note we have a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.

If you witness or experience unacceptable behavior, please contact the project maintainer at [your-email@example.com].  
All complaints will be reviewed and investigated and will result in a response deemed necessary and appropriate to the circumstances.

---

Thank you for considering contributing to Mudraa Invest!
