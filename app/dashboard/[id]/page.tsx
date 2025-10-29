"use client";

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Foods = {
  id: string;
  foodname: string;
  meal: string;
  fooddate_at: string;
  food_image_url: string;
  user_id: string;
  created_at: string;
  update_at: string;
};

type UserTackers = {
  id: string;
  fullname: string;
  email: string;
  password: string;
  gender: string;
  user_image_url: string;
  created_at: string;
  update_at: string;
};

export default function Dashboard() {
  const [foods, setFoods] = useState<Foods[]>([]);
  const [users, setUsers] = useState<UserTackers[]>([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const [foodRes, userRes] = await Promise.all([
        supabase.from("food_tb").select("*").eq("user_id", id),
        supabase.from("user_tb").select("*").eq("id", id),
      ]);

      if (foodRes.error || userRes.error) {
        console.error(foodRes.error || userRes.error);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        return;
      }

      setFoods(foodRes.data as Foods[]);
      setUsers(userRes.data as UserTackers[]);
    };

    fetchData();
  }, [id]);

  const handleDelete = async (foodId: string, image_url: string) => {
    if (!confirm("คุณต้องการลบรายการอาหารนี้ใช่หรือไม่")) return;

    try {
      if (image_url) {
        const imagePath = image_url.replace(/^.*\/task_bk\//, "");
        const { error: storageError } = await supabase.storage
          .from("task_bk")
          .remove([imagePath]);
        if (storageError) throw storageError;
      }

      const { error: dbError } = await supabase
        .from("food_tb")
        .delete()
        .eq("id", foodId);
      if (dbError) throw dbError;

      setFoods((prev) => prev.filter((f) => f.id !== foodId));
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูลหรือรูปภาพ");
    }
  };

  return (
    <div className="min-h-screen bg-purple-100 p-8">
      <div className="container mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-600">Food Dashboard</h1>
          {users.length > 0 && (
            <Link href={"/profile/" + users[0].id}>
              <Image
                src={users[0].user_image_url}
                alt="User Profile"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-400"
              />
            </Link>
          )}
        </div>

        {/* Add Food Button */}
        <div className="mb-6 flex justify-center md:justify-end">
          <Link href={"/addfood/" + id}>
            <div className="transform rounded-full bg-purple-500 px-6 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-purple-600">
              + Add Food
            </div>
          </Link>
        </div>

        {/* Food Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg bg-white shadow-md">
            <thead>
              <tr className="bg-purple-200 text-left text-gray-700">
                <th className="px-6 py-3 font-semibold">ชื่ออาหาร</th>
                <th className="px-6 py-3 font-semibold">มื้ออาหาร</th>
                <th className="px-6 py-3 text-right font-semibold">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {foods.length > 0 ? (
                foods.map((food) => (
                  <tr key={food.id} className="hover:bg-purple-50">
                    <td className="px-6 py-3">{food.foodname}</td>
                    <td className="px-6 py-3">{food.meal}</td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/updatefood/${food.id}`}>
                        <button className="mr-2 transform rounded-full bg-purple-500 px-4 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-purple-600">
                          แก้ไข
                        </button>
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(food.id, food.food_image_url)
                        }
                        className="transform rounded-full bg-red-500 px-4 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-red-600"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500 italic"
                  >
                    ยังไม่มีข้อมูลอาหาร
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
