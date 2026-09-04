// Data kredit film pembuka (Section 0 Step 2)
// Sesuai susunan akademik: Dosen Pengampu & Tim Penyusun Kelompok 6 PDB 93

export interface MemberCredit {
  name: string;
  nim: string;
}

export const DOSEN_PENGAMPU = {
  label: "DIBAWAH BIMBINGAN",
  name: "Drs. Eddy Sugiri, M.Hum.",
  nip: "NIP. 195508051985021001",
};

export const TEAM_CREDIT_LABEL = "DISUSUN OLEH";

export const MEMBERS_LEFT: MemberCredit[] = [
  { name: "Akbar Arya Maulana", nim: "626107097035" },
  { name: "Arya Rizky Ardhi Pratama", nim: "626103051310" },
  { name: "Dinda Naura Firdausy", nim: "626115327032" },
];

export const MEMBERS_RIGHT: MemberCredit[] = [
  { name: "Izzatul Hayati", nim: "626113145087" },
  { name: "Muhammad Adyan Faqih Huddin", nim: "626103051312" },
  { name: "Salma Nur Khasanah", nim: "626107097032" },
];

export const PRODI_LABEL =
  "PROGRAM PEMBELAJARAN DASAR BERSAMA (PDB) 93  ·  UNIVERSITAS AIRLANGGA  ·  2026";
