import React from 'react';
import { useSelector } from 'react-redux';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">My Profile</h1>
      {user && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p><strong>Name:</strong> {user.fullName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phoneNumber}</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;