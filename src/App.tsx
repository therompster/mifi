import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
import './App.css';
import AccountOverview from './Account.tsx';
import Advisor from './routes/Advisor.tsx';
import Transactions from './routes/Transactions.tsx';
import Profile from './routes/Profile.tsx';
import FAQ from './routes/FAQ.tsx';
import Terms from './routes/Terms.tsx';
import Contact from './routes/Contact.tsx';
import LoginPage from './components/LoginPage';
import ResetPassword from './components/ResetPassword';
import NewPassword from './components/NewPassword';
import CreateAccount from './components/CreateAccount';

function App() {
    return (
        <Router>
            <Header subtitle="K-12 personal finance assistant">IFi</Header>
            <div className="app-content">
                <Routes>
                    <Route path="/" element={<AccountOverview totalBalance={3500.00} availableCredit={5000.00} />} />
                    <Route path="/advisor" element={<Advisor />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/reset-password/:token" element={<NewPassword />} />
                    <Route path="/register" element={<CreateAccount />} />
                </Routes>
            </div>
            <Footer />
        </Router>
    );
}

export default App;
