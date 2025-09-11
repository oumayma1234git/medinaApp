import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderWrapper from "../components/Header/HeaderWrapper";
import NavBar from "../components/Header/NavBar";
import Logo from "../components/Header/Logo";
import FooterCompound from "../compounds/FooterCompound";
import SignFormWrapper from "../components/SignForm/SignFormWrapper";
import SignFormBase from "../components/SignForm/SignFormBase";
import SignFormTitle from "../components/SignForm/SignFormTitle";
import SignFormInput from "../components/SignForm/SignFormInput";
import SignFormButton from "../components/SignForm/SignFormButton";
import SignFormText from "../components/SignForm/SignFormText";
import SignFormLink from "../components/SignForm/SignFormLink";
import SignFormCaptcha from "../components/SignForm/SignFormCaptcha";
import SignFormError from "../components/SignForm/SignFormError";
import Warning from "../components/Header/Warning";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isInvalid = password === "" || email === "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Échec de la connexion");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.username);
      localStorage.setItem("userEmail", data.user.email);
      navigate("/");
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <HeaderWrapper className="header-wrapper-home">
        <NavBar className="navbar-signin">
          <Logo />
        </NavBar>
        <SignFormWrapper>
          <SignFormBase onSubmit={handleSubmit} method="POST">
            <Warning>Cinema Medina</Warning>
            <SignFormTitle>Connexion</SignFormTitle>
            {error && <SignFormError>{error}</SignFormError>}
            
            <SignFormInput
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={({ target }) => setEmail(target.value)}
            />
            <SignFormInput
              type="password"
              placeholder="Mot de passe"
              autoComplete="off"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />

            <SignFormButton disabled={isInvalid || isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </SignFormButton>
            
            <SignFormText>
              Nouveau sur Cinema Medina?{" "}
              <SignFormLink href="/signup">S'inscrire</SignFormLink>
            </SignFormText>
            
            <SignFormCaptcha>
              Cette page est protégée par Google reCAPTCHA.
            </SignFormCaptcha>
          </SignFormBase>
        </SignFormWrapper>
      </HeaderWrapper>
      <FooterCompound />
    </>
  );
};

export default SignIn;