"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Register() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [image_file, setImageFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");

  const router = useRouter();
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // บันทึกรูปภาพไปยัง Supabase Storage
    let image_url = "";
    if (image_file) {
      const new_image_file_name = `${Date.now()}-${image_file.name}`;

      // อัปโหลดรูปภาพไปยัง Supabase Storage
      const { error } = await supabase.storage
        .from("user_bk")
        .upload(new_image_file_name, image_file);
      if (error) {
        alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        console.log(error.message);
        return;
      } else {
        // get url ของรูปภาพที่อัปโหลด
        const { data } = supabase.storage
          .from("user_bk")
          .getPublicUrl(new_image_file_name);
        image_url = data.publicUrl;
      }
    }

    // บันทึกข้อมูลงานลงในตาราง tasks
    const { error } = await supabase.from("user_tb").insert({
      fullname: fullName,
      email: email,
      password: password,
      gender: gender,
      user_image_url: image_url,
    });

    if (error) {
      console.log(error.message);
      return;
    } else {
      alert("บันทึกข้อมูลเรียบร้อย");
      setFullName("");
      setEmail("");
      setPassword("");
      setGender("");
      setPreviewImage(null);
      image_url = "";
      router.push("/login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 text-black">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-600">
          Register
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              ชื่อ-สกุล
            </label>
            <input
              id="name"
              type="text"
              placeholder="Full Name"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

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
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={email}
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
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              เพศ
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  className="text-blue-600 focus:ring-blue-500"
                  onChange={(e) => setGender(e.target.value)}
                />
                <span className="ml-2 text-gray-700">ชาย</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  className="text-blue-600 focus:ring-blue-500"
                  onChange={(e) => setGender(e.target.value)}
                />
                <span className="ml-2 text-gray-700">หญิง</span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="profileImage"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              รูปโปรไฟล์
            </label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-md border border-gray-300 p-2 text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {previewImage && (
            <div className="mb-4 text-center">
              <p className="text-sm font-medium text-gray-700">Image Preview</p>
              <div className="relative mx-auto mt-2 h-32 w-32 overflow-hidden rounded-full border-2 border-blue-500 shadow-md">
                <Image
                  src={previewImage}
                  alt="Profile Preview"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full transform rounded-full bg-blue-600 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            ลงทะเบียน
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
