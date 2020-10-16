import "../styles/globals.css";
import { useRouter } from "next/router";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  const { query, push } = useRouter();
  useEffect(() => {
    if (query.auth_token) {
      localStorage.setItem("auth", query.auth_token);
      push("/profile");
    }
  }, [query]);
  return <Component {...pageProps} />;
}

export default MyApp;
