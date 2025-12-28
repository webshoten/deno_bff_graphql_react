import { Header } from "./components/Header.tsx";
import { UserRegistrationForm } from "./components/UserRegistrationForm.tsx";
import { UserCount } from "./components/UserCount.tsx";
import { UserList } from "./components/UserList.tsx";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <UserRegistrationForm />
        <UserCount />
        <UserList />
      </div>
    </div>
  );
}

export default App;
