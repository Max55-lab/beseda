import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, setToken, hasToken } from "../lib/api.js";

export default function Zajednica() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authMsg, setAuthMsg] = useState("");
  const [words, setWords] = useState([]);
  const [statusFilter, setStatusFilter] = useState("approved");
  const [form, setForm] = useState({ rijec: "", znacenje: "", govor_id: "zagreb", tema: "svakodnevica" });
  const [msg, setMsg] = useState("");

  const loadUser = async () => {
    if (!hasToken()) { setUser(null); return; }
    try { const d = await api.me(); setUser(d.user); } catch { setToken(null); setUser(null); }
  };

  const loadWords = async () => {
    try {
      const d = await api.words({ status: statusFilter, limit: 200 });
      setWords(d.words || []);
    } catch (e) { setMsg(e.message); }
  };

  useEffect(() => { loadUser(); }, []);
  useEffect(() => { loadWords(); }, [statusFilter]);

  const doAuth = async (e) => {
    e.preventDefault();
    setAuthMsg("");
    try {
      const fn = authMode === "register" ? api.register : api.login;
      const d = await fn(authForm.username, authForm.password);
      setToken(d.token);
      setUser(d.user);
      setAuthMsg(`Prijavljen kao ${d.user.username} (${d.user.role}).`);
    } catch (err) { setAuthMsg(err.message); }
  };

  const logout = () => { setToken(null); setUser(null); };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const d = await api.submitWord({
        rijec: form.rijec,
        znacenje: form.znacenje,
        govor_id: form.govor_id,
        tema: form.tema,
      });
      setMsg(`Poslano: ${d.word.rijec} (status: ${d.word.status}).`);
      setForm({ ...form, rijec: "", znacenje: "" });
      loadWords();
    } catch (err) { setMsg(err.message); }
  };

  const approve = async (id) => {
    try { await api.setStatus(id, "approved"); loadWords(); } catch (e) { setMsg(e.message); }
  };

  const reject = async (id) => {
    try { await api.setStatus(id, "rejected"); loadWords(); } catch (e) { setMsg(e.message); }
  };

  return (
    <div className="page container section">
      <div className="page-head">
        <p className="kicker">Zajednica</p>
        <h1 className="h1">Zajednički rječnik.</h1>
        <p className="lead lead-uzak">
          Riječi koje korisnici dodaju idu na uredničku provjeru prije objave. Backend
          mora biti pokrenut na <code>localhost:3002</code>.
        </p>
      </div>

      {!user ? (
        <div className="card" style={{ maxWidth: 400 }}>
          <h2 className="h3">{authMode === "login" ? "Prijava" : "Registracija"}</h2>
          <form onSubmit={doAuth} className="form">
            <input placeholder="Korisničko ime" value={authForm.username} onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })} required />
            <input type="password" placeholder="Lozinka" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
            <button type="submit" className="btn btn-terra">{authMode === "login" ? "Prijavi se" : "Registriraj se"}</button>
          </form>
          <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
            {authMode === "login" ? "Nemaš račun? Registriraj se" : "Već imaš račun? Prijavi se"}
          </button>
          {authMsg && <p className="forma-napomena">{authMsg}</p>}
        </div>
      ) : (
        <div className="card" style={{ maxWidth: 400, marginBottom: 16 }}>
          <p>Prijavljen kao <strong>{user.username}</strong> ({user.role}).</p>
          <button type="button" className="btn btn-ghost" onClick={logout}>Odjava</button>
        </div>
      )}

      {user && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 className="h3">Dodaj riječ (ide na provjeru)</h2>
          <form onSubmit={submit} className="form">
            <input placeholder="Riječ *" value={form.rijec} onChange={(e) => setForm({ ...form, rijec: e.target.value })} required />
            <input placeholder="Značenje *" value={form.znacenje} onChange={(e) => setForm({ ...form, znacenje: e.target.value })} required />
            <input placeholder="Govor (id, npr. zagreb)" value={form.govor_id} onChange={(e) => setForm({ ...form, govor_id: e.target.value })} />
            <input placeholder="Tema" value={form.tema} onChange={(e) => setForm({ ...form, tema: e.target.value })} />
            <button type="submit" className="btn btn-terra">Pošalji na provjeru</button>
          </form>
          {msg && <p className="forma-napomena">{msg}</p>}
        </div>
      )}

      <div className="filteri" style={{ marginBottom: 16 }}>
        {["approved", "pending", "all"].map((s) => (
          <button key={s} type="button" className={`cip ${statusFilter === s ? "je-aktivan" : ""}`} onClick={() => setStatusFilter(s)}>
            {s === "approved" ? "Odobreno" : s === "pending" ? "Na čekanju" : "Sve"}
          </button>
        ))}
      </div>

      <ul className="usporedba-lista">
        {words.map((w) => (
          <li key={w.id} className="usporedba-red">
            <div className="usporedba-rijec">
              <span className="usporedba-naslov">{w.rijec}</span>
              <span className="usporedba-izgovor">[{w.govor_id}]</span>
            </div>
            <div className="usporedba-detalji">
              <span className="usporedba-znacenje">{w.znacenje}</span>
              <span className="usporedba-mjesto">{w.status} · {w.autor || "—"}</span>
            </div>
            {user?.role === "urednik" && w.status === "pending" && (
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button type="button" className="btn btn-mali btn-terra" onClick={() => approve(w.id)}>Odobri</button>
                <button type="button" className="btn btn-mali btn-ghost" onClick={() => reject(w.id)}>Odbij</button>
              </div>
            )}
          </li>
        ))}
        {!words.length && <li className="prazno">Nema riječi.</li>}
      </ul>
    </div>
  );
}