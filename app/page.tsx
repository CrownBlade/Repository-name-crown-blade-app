"use client";

import { useEffect, useState } from "react";
import {
  Star,
  Trophy,
  Phone,
  Trash2,
  Pencil
} from "lucide-react";
import Image from "next/image";
import { supabase } from "../lib/supabase";

export default function Home() {

  const [clients, setClients] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [password, setPassword] = useState("");
const [logged, setLogged] = useState(false);

  const totalPoints = history.reduce(
  (acc, item) => acc + item.points,
  0
);
const topClientId = history.reduce((acc: any, item: any) => {

  acc[item.client_id] = (acc[item.client_id] || 0) + 1;

  return acc;

}, {});

const mostFrequentClientId =
  Object.keys(topClientId).length > 0
    ? Object.keys(topClientId).reduce(
        (a, b) =>
          topClientId[a] > topClientId[b]
            ? a
            : b
      )
    : null;

const mostFrequentClient = clients.find(
  (client) => client.id == mostFrequentClientId
);
async function getClients() {

  const { data } = await supabase
    .from("clients")
    .select("*");

  if (data) {
    setClients(data);
  }

}
  async function createClient() {


    if (!name || !phone) {
      alert("Completa los campos");
      return;
    }

    const { error } = await supabase
  .from("clients")
  .insert([
    {
      name,
      phone,
      points: 0
    }
  ]);

if (error) {
  console.log(error);
  alert(error.message);
  return;
}

    setName("");
    setPhone("");

    getClients();

    setMessage("✅ Cliente creado correctamente");

setTimeout(() => {
  setMessage("");
}, 3000);

  }

async function editClient(client: any) {

  const newName = prompt(
    "Nuevo nombre",
    client.name
  );

  const newPhone = prompt(
    "Nuevo teléfono",
    client.phone
  );

  if (!newName || !newPhone) return;

  await supabase
    .from("clients")
    .update({
      name: newName,
      phone: newPhone
    })
    .eq("id", client.id);

  getClients();

}
  async function addPoint(client: any) {

  const newPoints = client.points + 1;

  await supabase
    .from("clients")
    .update({
      points: newPoints
    })
    .eq("id", client.id);

  await supabase
    .from("history")
    .insert([
      {
        client_id: client.id,
        points: 1
      }
    ]);

  getClients();
getHistory();
}
async function getHistory() {

  const { data } = await supabase
    .from("history")
    .select("*")
    .order("created_at", { ascending: false });

  if (data) {
    setHistory(data);
  }

}

function login() {

  if (password === "crownblade123") {

    localStorage.setItem("logged", "true");

    setLogged(true);

  } else {

    alert("Contraseña incorrecta");

  }

}

useEffect(() => {

  const savedLogin = localStorage.getItem("logged");

  if (savedLogin === "true") {
    setLogged(true);
  }

  getClients();
  getHistory();

}, []);

  if (!logged) {

  return (

    <div style={{
      minHeight: "100vh",
      background: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 20
    }}>

      <div style={{
        width: "100%",
        maxWidth: 400,
        background: "#18181b",
        padding: 30,
        borderRadius: 20,
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}>

        <h1 style={{
          color: "white",
          fontSize: 32,
          fontWeight: "bold",
          textAlign: "center"
        }}>
          Crown & Blade
        </h1>

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {

  if (e.key === "Enter") {
    login();
  }

}}
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid #333",
            background: "#27272a",
            color: "white"
          }}
        />

        <button
          onClick={login}
          style={{
            padding: 16,
            borderRadius: 12,
            border: "none",
            background: "white",
            color: "black",
            fontWeight: "bold",
            fontSize: 16
          }}
        >
          Entrar
        </button>

      </div>

    </div>

  );

}

return (

  <main className="min-h-screen bg-black text-white p-4">

    <div className="max-w-xl mx-auto">

      <div className="flex flex-col items-center mb-10">

        <Image
          src="/logo.png"
          alt="Crown Blade"
          width={180}
          height={180}
          priority
          className="rounded-3xl overflow-hidden"
        />

        <h1 className="text-4xl font-bold text-center mt-4">
          Crown & Blade
        </h1>

        <p className="text-zinc-400 mt-2 text-center">
          Barber Studio Loyalty System
        </p>

      </div>

      <div className="flex flex-col gap-4 mb-10 relative z-[9999]">

        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 relative z-[9999]"
        />

        <input
          type="text"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 relative z-[9999]"
        />

        <button
          onClick={createClient}
          className="bg-white text-black p-4 rounded-xl font-bold relative z-[9999] touch-manipulation"
        >
          Crear Cliente
        </button>

        <button
  onClick={() => {

    localStorage.removeItem("logged");

    setLogged(false);

  }}
  className="bg-red-600 text-white p-3 rounded-xl font-bold"
>
  Cerrar Sesión
</button>

{message && (

  <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-xl text-center">

    {message}

  </div>

)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

  <div className="bg-zinc-900 p-5 rounded-2xl">

    <p className="text-zinc-400 text-sm">
      Clientes
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {clients.length}
    </h2>

  </div>

  <div className="bg-zinc-900 p-5 rounded-2xl">

    <p className="text-zinc-400 text-sm">
      Puntos Entregados
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {totalPoints}
    </h2>

  </div>

  <div className="bg-zinc-900 p-5 rounded-2xl">

    <p className="text-zinc-400 text-sm">
      Cliente Frecuente
    </p>

    <h2 className="text-xl font-bold mt-2">
      {mostFrequentClient?.name || "Ninguno"}
    </h2>

  </div>

</div>
<input
  type="text"
  placeholder="Buscar cliente..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 w-full mb-6"
/>
      <div className="flex flex-col gap-6 pb-32">

        {clients
  .filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  )
  .map((client) => (

          <div
            key={client.id}
            className="bg-zinc-900 p-6 rounded-2xl"
          >

            <h2 className="text-2xl font-bold">
              {client.name}
            </h2>

            <div className="flex items-center gap-2 mt-2 text-zinc-300">
              <Phone size={18} />
              {client.phone}
            </div>

            <div className="flex items-center gap-2 mt-3 text-xl">
              <Star size={20} />
              {client.points} puntos
            </div>

            <div className="w-full bg-zinc-700 h-4 rounded-full mt-4 overflow-hidden">

              <div
                className="bg-yellow-400 h-4"
                style={{
                  width: `${(client.points / 10) * 100}%`
                }}
              />

            </div>

            <p className="mt-2 text-sm text-zinc-400">
              Progreso hacia Servicio Deluxe
            </p>

            {client.points >= 5 && client.points < 10 && (

              <div className="flex items-center gap-2 mt-3 text-green-400 font-bold">
                <Trophy size={20} />
                Corte Gratis Desbloqueado
              </div>

            )}

            {client.points >= 10 && (

              <div className="flex items-center gap-2 mt-3 text-yellow-400 font-bold">
                <Trophy size={20} />
                Servicio Deluxe Desbloqueado
              </div>

            )}

            <div className="flex flex-col gap-3 mt-5">
<button
  onClick={() => editClient(client)}
  className="bg-blue-600 p-3 rounded-xl"
>

  <div className="flex items-center justify-center gap-2">
    <Pencil size={18} />
    Editar
  </div>

</button>
              <button
                onClick={() => addPoint(client)}
                className="bg-yellow-400 text-black p-3 rounded-xl font-bold"
              >
                +1 Punto
              </button>

              <button
                onClick={async () => {

                  await supabase
                    .from("clients")
                    .delete()
                    .eq("id", client.id);

                  getClients();

                }}
                className="bg-red-600 p-3 rounded-xl"
              >

                <div className="flex items-center justify-center gap-2">
                  <Trash2 size={18} />
                  Eliminar
                </div>

              </button>

            </div>

          </div>

        ))}

      </div>
<div className="mt-16">

  <h2 className="text-3xl font-bold mb-6">
    Historial Reciente
  </h2>

  <div className="flex flex-col gap-4">

    {history.slice(0, 10).map((item) => (

      <div
        key={item.id}
        className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"
      >

        <p className="text-yellow-400 font-bold">
          +{item.points} punto
        </p>

        <p className="text-zinc-400 text-sm mt-1">
          Cliente:
          {
            clients.find(
              (client) => client.id === item.client_id
            )?.name
          }
        </p>

        <p className="text-zinc-500 text-xs mt-1">
          {new Date(item.created_at).toLocaleString()}
        </p>

      </div>

    ))}

  </div>

</div>

    </div>

  </main>

);

}