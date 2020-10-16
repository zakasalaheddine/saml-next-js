import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { verifyToken } from "../services/auth";
import Axios from "axios";

export default function profile() {
  const { push } = useRouter();
  const [user, setUser] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("auth");
    if (!token) {
      push("/");
      return;
    }
    const tokenData = verifyToken(token);
    if (!tokenData.verified) {
      push("/");
      return;
    }
    setUser(tokenData.payload);
  }, []);
  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Uid: {user.uid}</p>
    </div>
  );
}
