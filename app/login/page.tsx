"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("user_tb")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error) {
      alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      console.log(error);
      return;
    }

    router.push("/dashboard/" + data.id);
    console.log("Login form submitted!");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-100 p-4 text-gray-800">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl border border-purple-200">
        <h1 className="mb-6 text-center text-3xl font-bold text-purple-700">
          เข้าสู่ระบบ
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              อีเมล์
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full transform rounded-full bg-purple-600 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ยังไม่มีบัญชีใช่ไหม?{" "}
          <Link
            href="/register"
            className="font-semibold text-purple-600 hover:underline"
          >
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </div>
  );
}
