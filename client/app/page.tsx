"use client";
import { useState } from "react";
import LoginForm, { LoginFormData } from "@/components/LoginForm";
import SignupForm, { SignupFormData } from "@/components/SignupForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { API } from "./constant";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AuthComponents() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, data)
      toast.success("Login successful!");
      router.push("/todos");
      Cookies.set("token", response.data.access_token);
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`Login failed: ${error.response.data.message}`);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, data)
      toast.success("Account Created Successfully!");
      router.push("/todos");
      console.log("Signup response:", response.data);
      Cookies.set("token", response.data.access_token);
    } catch (error) {
      console.error("Error while creating account:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`Account creation failed: ${error.response.data.message}`);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isLogin
              ? "Sign in to your account to continue"
              : "Fill in the details below to create your account"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLogin ? (
            <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} />
          ) : (
            <SignupForm onSubmit={handleSignupSubmit} isLoading={isLoading} />
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
