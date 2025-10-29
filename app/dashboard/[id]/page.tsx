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
      const { data, error } = await supabase
        .from("food_tb")
        .select("*")
        .eq("user_id", id);
      if (error) {
        alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
        console.log(error);
        return;
      }
      if (data) {
        setFoods(data as Foods[]);
      }
    };
    const getUsers = async () => {
      const { data, error } = await supabase
        .from("user_tb")
        .select("*")
        .eq("id", id);

      if (error) {
        alert("An error occurred while fetching user data.");
        console.log(error);
        return;
      }
      if (data) {
        setUsers(data as UserTackers[]);
      }
    };
    fetchData();
    getUsers();
  }, [id]);

  const handleDelete = async (foodId: string, image_url: string) => {
    if (confirm("คุณต้องการลบรายการอาหารนี้ใช่หรือไม่")) {
      if (image_url) {
        const image_name = image_url.split("/").pop();
        const { error } = await supabase.storage
          .from("task_bk")
          .remove([image_name as string]);
        if (error) {
          alert("พบปัญหาในการลบรูปภาพ ออกจาก Storage");
          console.log(error.message);
          return;
        }
      }

      const { error } = await supabase
        .from("food_tb")
        .delete()
        .eq("id", foodId);
      if (error) {
        alert("พบปัญหาในการลบข้อมูล");
        console.log(error.message);
        return;
      }

      setFoods(foods.filter((food) => food.id !== foodId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="mb-6 text-3xl font-bold text-blue-600">
            Food Dashboard
          </h1>
          {users.map((user) => (
            <Link href={"/profile/" + user.id} key={user.id}>
              <Image
                src={user.user_image_url}
                alt="User Profile"
                width={100}
                height={100}
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
          ))}
        </div>
        {/* Search Bar and Add Food Button */}
        <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link href={"/addfood/" + id}>
            <div className="w-full transform rounded-full bg-green-500 px-6 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-green-600 md:w-auto">
              + Add Food
            </div>
          </Link>
        </div>

        {/* Food List Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg bg-white shadow-md">
            <thead>
              <tr className="bg-gray-200 text-left text-gray-700">
                <th className="px-6 py-3 font-semibold">ชื่ออาหาร</th>
                <th className="px-6 py-3 font-semibold">มื้ออาหาร</th>
                <th className="px-6 py-3 text-right font-semibold">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food, key) => (
                <tr key={key}>
                  <td className="px-6 py-3">{food.foodname}</td>
                  <td className="px-6 py-3">{food.meal}</td>
                  <td className="px-6 py-3 text-right">
                    <Link href={`/updatefood/${food.id}`}>
                      <button className="mr-2 transform rounded-full bg-blue-500 px-4 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-600">
                        แก้ไข
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(food.id, food.food_image_url)}
                      className="transform rounded-full bg-red-500 px-4 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-red-600"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
