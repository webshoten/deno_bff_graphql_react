import { useState } from "react";
import { Header } from "./components/Header.tsx";
import { UserRegistrationForm } from "./components/UserRegistrationForm.tsx";
import { UserCount } from "./components/UserCount.tsx";
import { UserList } from "./components/UserList.tsx";

function App() {
  const [usersVersion, setUsersVersion] = useState(0);
  const [userCountVersion, setUserCountVersion] = useState(0);

  const handleUserChanged = () => {
    setUsersVersion((v) => v + 1);
    setUserCountVersion((v) => v + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <UserRegistrationForm onSuccess={handleUserChanged} />
        <UserCount version={userCountVersion} />
        <UserList
          version={usersVersion}
          onUserChanged={handleUserChanged}
        />
      </div>
    </div>
  );
}

export default App;
