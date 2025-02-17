import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { Redirect } from "expo-router";
import Onboarding from "@/components/onboarding";
import Login from "./(auth)/login";

export default function Welcome() {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // check firstLoad ? return onboarding UI : login
  // logged ? redirect to home : stay in login screen
  useEffect(() => {
    const checkFirstLoad = async() => {
      const firstLoad = await SecureStore.getItem("firstLoad");
      console.log("FirstLoad: " + firstLoad);
      if(firstLoad === "false") {
        setIsFirstLoad(false);
      }
      setIsLoading(false);
    }
    checkFirstLoad();
  }, [])

  if(isLoading) {
    // loader component
  }

  return (
    // onboarding screen if first load
    <>
      {isFirstLoad ? <Onboarding /> : <Login/>}
    </>
  );
}
