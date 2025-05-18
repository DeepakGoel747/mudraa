# Mudraa Invest

Mudraa Invest is a mobile application offering zero-brokerage stock trading for users in the Indian market. It is designed for both novice and experienced traders, providing a seamless and intuitive trading experience with real-time data and analysis tools.

---

## Objective

The primary objectives of the Mudraa project are:

1. To develop a mobile application offering zero-brokerage stock trading for users in the Indian market.
2. To design an intuitive and user-friendly interface suitable for both novice and experienced traders, simplifying the investment process.
3. To integrate comprehensive, real-time stock market data, including search history and analysis tools, to support informed decision-making.

---

## Scope of the Project

The scope of the Mudraa project encompasses the development of a mobile trading application focused on the Indian equity market.

**Inclusions:**
- The application provides zero-brokerage trading facilities for stocks listed on the National Stock Exchange (NSE) and the Bombay Stock Exchange (BSE).
- Key features include user account management, real-time stock data display, stock search functionality (including history), order placement (buy/sell), and portfolio tracking.

**Exclusions:**
- The current version of the project does not include trading in other financial instruments such as Mutual Funds, Futures & Options, Commodities, or Currencies.
- Functionality for applying to Initial Public Offerings (IPOs) is also outside the current scope.
- Advanced order types (like bracket orders or cover orders) and margin trading facilities are not implemented.

---

## Financial Data API

Access to reliable and timely financial data is crucial. For this project, we adopted a multi-source strategy:

1. **Smart API (Angel One):**  
   Used for fetching real-time data specifically for major Indian indices, namely the NIFTY 50 and SENSEX. The implementation includes a dummy service for Angel One to simulate this core functionality.

2. **Yahoo Finance (`yfinance` library):**  
   Chosen as the primary source for fetching historical stock data used in charts, as well as for detailed individual stock quotes including key financial ratios and statistics. It also serves as a source for general market index data beyond the live NIFTY 50/SENSEX feeds.

3. **RapidAPI (configurable provider):**  
   To obtain a broad range of real-time stock data—including stock search results, market-wide lists (e.g., top gainers, top losers, popular stocks), company profiles, and detailed financial statements—the system is designed to integrate with a configurable stock data provider via RapidAPI (such as Mboum Finance, Indian Stock Exchange API2, or similar).

4. **Finnhub:**  
   Integrated for relevant financial news, complementing the market data.

This multi-API approach allows the application to cover diverse data needs while managing budget constraints, leveraging free or developer-friendly tiers where possible.

---

## Tools and Technologies Used

We selected the following tools and technologies for the development of Mudraa Invest:

### Frontend
- **React Native (v0.78.0):** For building the cross-platform mobile application.
- **TypeScript:** For writing type-safe JavaScript code, improving code quality and maintainability.
- **React Navigation (v7):** For implementing screen navigation and routing within the app.
- **Axios:** For making HTTP requests from the client to the backend API.
- **React Native Paper:** A UI component library used for building a consistent and visually appealing user interface.
- **React Native Chart Kit:** For displaying financial charts and data visualizations.
- **React Native Linear Gradient:** Utilized for enhancing UI styling with gradient effects.
- **AsyncStorage:** For persisting small amounts of data locally on the user's device.

### Backend
- **Python:** Employed for data processing, analysis tasks, and potentially other backend services.
- **JWT (JSON Web Tokens):** For implementing secure, token-based authentication and authorization.
- **RESTful API Design:** REST principles were followed for designing the communication interface between the frontend and backend.

### Database
- **Firebase:** Chosen as the NoSQL database for its flexibility and scalability.

### Development Tools
- **npm/yarn:** For managing project dependencies (Node.js packages).
- **ESLint:** For enforcing code quality and consistent coding style.
- **Jest:** A JavaScript testing framework used for writing unit and integration tests.
- **Git:** For version control and collaborative development.
- **Git hosting platforms:** GitHub, GitLab

---

## App Screenshots

Below are sample screens from Mudraa Invest:

**1. Home/Dashboard Screen**  
Shows market indices (NIFTY 50, SENSEX, etc.), quick news highlights, and a stock/company watchlist with prices and changes. The bottom navigation gives access to Home, Exchange, Screen, and Wallet.

**2. Login Screen**  
Features multiple login options: Facebook, Google, Apple, and classic email/password. Includes "Forgot Password?" and "Sign up" prompts for a user-friendly authentication experience.

**3. Hot News Screen**  
Displays the latest financial and stock market news articles in a grid format. Each card presents the news source, date, and a headline, helping users stay updated on important events.

**4. Wallet & Portfolio Screen**  
Summarizes the user's total portfolio value and available funds, with clear buttons for depositing and withdrawing. The portfolio section allows users to view positions, holdings, and orders, and encourages them to start trading.

> _You can add images here using Markdown once you upload them to the repo:_
> ```
> ![Home Screen](screenshots/home.png)
> ![Login Screen](screenshots/login.png)
> ![Hot News](screenshots/news.png)
> ![Wallet & Portfolio](screenshots/wallet.png)
> ```

---

## Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Step 1: Start Metro

To start the Metro dev server, run:

```sh
npm start
# or
yarn start
