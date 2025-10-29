"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";

export default function AddFood() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [image_file, setImageFile] = useState<File | null>(null);
  const [foodname, setFoodname] = useState("");
  const [meal, setMeal] = useState("");
  const [fooddate_at, setFooddate_at] = useState("");

  const { id } = useParams();
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

    let image_url = "";
    if (image_file) {
      const new_image_file_name = `${Date.now()}-${image_file.name}`;

      const { error } = await supabase.storage
        .from("food_bk")
        .upload(new_image_file_name, image_file);

      if (error) {
        alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        console.log(error.message);
        return;
      } else {
        const { data } = supabase.storage
          .from("food_bk")
          .getPublicUrl(new_image_file_name);
        image_url = data.publicUrl;
      }
    }

    const { error } = await supabase.from("food_tb").insert({
      foodname,
      meal,
      fooddate_at,
      food_image_url: image_url,
      user_id: id,
    });

    if (error) {
      alert("เกิดข้อผิดพลาดในการเพิ่มรายการอาหาร");
      console.log(error);
      return;
    } else {
      alert("เพิ่มรายการอาหารถูกต้องแล้ว");
      setFoodname("");
      setMeal("");
      setFooddate_at("");
      setPreviewImage(null);
      image_url = "";
      router.push("/dashboard/" + id);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-purple-600">
          เพิ่มรายการอาหาร
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Food Name Input */}
          <div>
            <label
              htmlFor="foodName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              ชื่ออาหาร
            </label>
            <input
              id="foodName"
              type="text"
              placeholder="ชื่ออาหาร"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
              value={foodname}
              onChange={(e) => setFoodname(e.target.value)}
              required
            />
          </div>

          {/* Meal Type Selection */}
          <div>
            <label
              htmlFor="mealType"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              มื้ออาหาร
            </label>
            <select
              id="mealType"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
              required
            >
              <option value="">เลือกมื้ออาหาร</option>
              <option value="breakfast">มื้อเช้า</option>
              <option value="lunch">มื้อกลางวัน</option>
              <option value="dinner">มื้อเย็น</option>
              <option value="snack">ของว่าง</option>
            </select>
          </div>

          {/* Date Input */}
          <div>
            <label
              htmlFor="date"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              วัน/เดือน/ปี
            </label>
            <input
              id="date"
              type="date"
              className="w-full rounded-md border border-gray-300 p-2 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
              value={fooddate_at}
              onChange={(e) => setFooddate_at(e.target.value)}
              required
            />
          </div>

          {/* Image Input with Preview */}
          <div>
            <label
              htmlFor="foodImage"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              รูปอาหาร
            </label>
            <label
              htmlFor="foodImage"
              className="flex w-full cursor-pointer items-center justify-center rounded-md border border-purple-500 bg-purple-50 py-2.5 font-semibold text-purple-700 transition-colors hover:bg-purple-100"
            >
              เลือกรูปภาพ
            </label>
            <input
              id="foodImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
          </div>

          {previewImage && (
            <div className="text-center">
              <p className="mb-2 text-sm font-medium text-gray-700">
                ตัวอย่างรูปภาพ
              </p>
              <div className="relative mx-auto h-40 w-full overflow-hidden rounded-md border-2 border-purple-500 shadow-md">
                <Image
                  src={previewImage}
                  alt="Food Preview"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between space-x-4">
            <Link href={"/dashboard/" + id} className="w-1/2">
              <div className="transform rounded-full border border-gray-300 bg-white py-2.5 text-center font-semibold text-gray-700 shadow-md transition-all duration-300 hover:scale-105 hover:bg-gray-100">
                ย้อนกลับ
              </div>
            </Link>
            <button
              type="submit"
              className="w-1/2 transform rounded-full bg-purple-600 py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-purple-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
