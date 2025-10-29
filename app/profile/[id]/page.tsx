"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Profile() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [image_file, setImageFile] = useState<File | null>(null);
  const [old_image_file, setOldImageFile] = useState<string>("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const { id } = useParams();
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("user_tb")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("พบปัญหาในการดึงข้อมูลผู้ใช้");
        console.log(error.message);
        return;
      }

      if (data) {
        setFullName(data.fullname);
        setEmail(data.email);
        setPassword(data.password);
        setGender(data.gender);
        setPreviewImage(data.user_image_url);
        setOldImageFile(data.user_image_url);
      }
    };
    fetchData();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
      setImageFile(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let image_url = old_image_file;

    if (image_file) {
      if (old_image_file) {
        const oldImageName = old_image_file.split("/").pop();
        if (oldImageName) {
          const { error: removeError } = await supabase.storage
            .from("user_bk")
            .remove([oldImageName]);
          if (removeError) {
            console.log("ลบรูปเก่าไม่สำเร็จ:", removeError.message);
          }
        }
      }

      const fileExt = image_file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("user_bk")
        .upload(fileName, image_file);

      if (uploadError) {
        alert("อัปโหลดรูปภาพไม่สำเร็จ");
        console.log(uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("user_bk")
        .getPublicUrl(fileName);

      image_url = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("user_tb")
      .update({
        fullname: fullName,
        email,
        password,
        gender,
        user_image_url: image_url,
      })
      .eq("id", id);

    if (updateError) {
      alert("อัปเดตข้อมูลไม่สำเร็จ");
      console.log(updateError.message);
    } else {
      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
      setOldImageFile(image_url);
      setImageFile(null);
      router.push("/dashboard/" + id);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-600">
          แก้ไขข้อมูลโปรไฟล์
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Preview */}
          <div className="text-center">
            <p className="mb-2 text-sm font-medium text-gray-700">รูปโปรไฟล์</p>
            <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full border-2 border-blue-500 shadow-md">
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Profile Preview"
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <label
              htmlFor="profileImage"
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-blue-500 bg-blue-50 px-4 py-2 font-semibold text-blue-700 transition-colors hover:bg-blue-100"
            >
              เลือกรูปภาพใหม่
            </label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
          </div>

          {/* Form Inputs */}
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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                  checked={gender === "male"}
                  onChange={() => setGender("male")}
                />
                <span className="ml-2 text-gray-700">ชาย</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={() => setGender("female")}
                />
                <span className="ml-2 text-gray-700">หญิง</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-4">
            <Link href={"/dashboard/" + id} className="w-1/2">
              <div className="transform rounded-full border border-gray-300 bg-white py-2.5 text-center font-semibold text-gray-700 shadow-md transition-all duration-300 hover:scale-105 hover:bg-gray-100">
                ย้อนกลับ
              </div>
            </Link>
            <button
              type="submit"
              className="w-1/2 transform rounded-full bg-blue-600 py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
