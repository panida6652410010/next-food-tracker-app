"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditFood() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [image_file, setImageFile] = useState<File | null>(null);
  const { id } = useParams();
  const [foodname, setFoodName] = useState("");
  const [meal, setMeal] = useState("");
  const [foodDateAt, setFoodDateAt] = useState("");
  const [old_image_file, setOldImageFile] = useState<string>("");
  const [userId, setUserId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("food_tb")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("พบปัญหาในการดึงข้อมูลงานเก่า");
        console.log(error.message);
        return;
      }

      if (data) {
        setUserId(data.user_id);
        setFoodName(data.foodname);
        setMeal(data.meal);
        let formattedDate = "";
        const rawDate = data.fooddate_at;

        if (rawDate) {
          if (rawDate.includes("/")) {
            const [mm, dd, yyyy] = rawDate.split("/");
            formattedDate = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(
              2,
              "0"
            )}`;
          } else if (rawDate.includes("T")) {
            formattedDate = new Date(rawDate).toISOString().split("T")[0];
          } else {
            formattedDate = rawDate;
          }
        }

        setFoodDateAt(formattedDate);
        setUserId(data.user_id);
        setPreviewImage(data.food_image_url);
        setOldImageFile(data.food_image_url);
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

  const handleUploadAndUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let image_url = old_image_file;

    if (image_file) {
      if (old_image_file) {
        const oldImageName = old_image_file.split("/").pop();
        if (oldImageName) {
          const { error: removeError } = await supabase.storage
            .from("food_bk")
            .remove([oldImageName]);
          if (removeError) {
            console.log("ลบรูปเก่าไม่สำเร็จ:", removeError.message);
          }
        }
      }

      const fileExt = image_file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("food_bk")
        .upload(fileName, image_file);

      if (uploadError) {
        alert("อัปโหลดรูปภาพไม่สำเร็จ");
        console.log(uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("food_bk")
        .getPublicUrl(fileName);

      image_url = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("food_tb")
      .update({
        foodname,
        meal,
        food_image_url: image_url,
        fooddate_at: foodDateAt,
        update_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      alert("เกิดข้อผิดพลาดในการบันทึกการแก้ไขข้อมูล");
      console.error(updateError.message);
      return;
    } else {
      alert("บันทึกแก้ไขข้อมูลเรียบร้อย");
      setOldImageFile(image_url);
      setImageFile(null);
      router.push(`/dashboard/${userId}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-blue-600">
          แก้ไขรายการอาหาร
        </h1>

        <form onSubmit={handleUploadAndUpdate} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ชื่ออาหาร
            </label>
            <input
              type="text"
              value={foodname}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              มื้ออาหาร
            </label>
            <select
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            >
              <option value="">เลือกมื้ออาหาร</option>
              <option value="breakfast">มื้อเช้า</option>
              <option value="lunch">มื้อกลางวัน</option>
              <option value="dinner">มื้อเย็น</option>
              <option value="snack">ของว่าง</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              วัน/เดือน/ปี
            </label>
            <input
              type="date"
              value={foodDateAt}
              onChange={(e) => setFoodDateAt(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              รูปอาหาร
            </label>
            <label
              htmlFor="foodImage"
              className="flex w-full cursor-pointer items-center justify-center rounded-md border border-blue-500 bg-blue-50 py-2.5 font-semibold text-blue-700 transition-colors hover:bg-blue-100"
            >
              เลือกรูปภาพใหม่
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
                Image Preview
              </p>
              <div className="relative mx-auto h-40 w-full overflow-hidden rounded-md border-2 border-blue-500 shadow-md">
                <Image
                  src={previewImage}
                  alt="Food Preview"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between space-x-4">
            <Link href={`/dashboard/${userId}`} className="w-1/2">
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
