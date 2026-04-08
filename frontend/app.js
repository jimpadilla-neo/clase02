(function () {
  "use strict";

  var SESSION_KEY = "petcare_session";

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      return data && typeof data.correo === "string" ? data : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(correo) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ correo: correo }));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function setButtonLoading(button, loading) {
    if (!button) return;
    var text = button.querySelector(".btn-texto");
    var load = button.querySelector(".btn-cargando");
    button.disabled = !!loading;
    if (loading) {
      button.setAttribute("aria-busy", "true");
      if (text) text.hidden = true;
      if (load) load.hidden = false;
    } else {
      button.removeAttribute("aria-busy");
      if (text) text.hidden = false;
      if (load) load.hidden = true;
    }
  }

  function showUserBadge(correo) {
    var badge = document.getElementById("badge-usuario");
    if (!badge) return;
    if (correo) {
      badge.textContent = "Sesión: " + correo;
      badge.hidden = false;
    } else {
      badge.textContent = "";
      badge.hidden = true;
    }
  }

  function applySessionToUI() {
    var s = getSession();
    showUserBadge(s ? s.correo : "");
    var correoMascota = document.getElementById("input-correo-mascota");
    if (s && correoMascota && !correoMascota.value) correoMascota.value = s.correo;
  }

  function switchTab(tabId) {
    var panels = document.querySelectorAll("#contenido-principal > section");
    panels.forEach(function (el) {
      el.classList.remove("active");
    });
    var target = document.getElementById(tabId);
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-link").forEach(function (link) {
      var on = link.getAttribute("data-tab") === tabId;
      link.setAttribute("aria-current", on ? "page" : "false");
    });
  }

  function initNav() {
    document.querySelectorAll(".nav-link[data-tab]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var tab = link.getAttribute("data-tab");
        if (tab) switchTab(tab);
      });
    });
    switchTab("inicio");
  }

  function initLogout() {
    var btn = document.getElementById("btn-salir");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var ok = window.confirm("¿Seguro que deseas cerrar sesión?");
      if (!ok) return;
      clearSession();
      showUserBadge("");
      switchTab("acceso");
    });
  }

  async function parseJsonResponse(res) {
    var text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (e) {
      return { detalle: text };
    }
  }

  document.getElementById("form-saludo")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = document.getElementById("btn-enviar-saludo");
    var out = document.getElementById("resultado-saludo");
    var nombre = document.getElementById("input-nombre-saludo").value.trim();
    if (!nombre) return;
    setButtonLoading(btn, true);
    out.textContent = "";
    try {
      var res = await fetch("/bienvenido/" + encodeURIComponent(nombre));
      var data = await parseJsonResponse(res);
      out.textContent = data && data.mensaje ? data.mensaje : "Sin respuesta.";
    } catch (err) {
      out.textContent = "Error de red o del servidor.";
    } finally {
      setButtonLoading(btn, false);
    }
  });

  document.getElementById("form-registro")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = document.getElementById("btn-registro");
    var out = document.getElementById("resultado-registro");
    var correo = document.getElementById("input-correo-registro").value.trim();
    var contraseña = document.getElementById("input-contrasena-registro").value;
    setButtonLoading(btn, true);
    out.textContent = "";
    try {
      var res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correo, contraseña: contraseña }),
      });
      var data = await parseJsonResponse(res);
      out.textContent = data && data.mensaje ? data.mensaje : JSON.stringify(data);
    } catch (err) {
      out.textContent = "Error de red o del servidor.";
    } finally {
      setButtonLoading(btn, false);
    }
  });

  document.getElementById("form-login")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = document.getElementById("btn-login");
    var out = document.getElementById("resultado-login");
    var correo = document.getElementById("input-correo-login").value.trim();
    var contraseña = document.getElementById("input-contrasena-login").value;
    setButtonLoading(btn, true);
    out.textContent = "";
    try {
      var res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correo, contraseña: contraseña }),
      });
      var data = await parseJsonResponse(res);
      if (data && data.usuario_encontrado) {
        setSession(correo);
        applySessionToUI();
        out.textContent = data.mensaje || "Sesión iniciada.";
      } else {
        out.textContent =
          data && data.mensaje ? data.mensaje + " (credenciales no válidas)" : "No se pudo iniciar sesión.";
      }
    } catch (err) {
      out.textContent = "Error de red o del servidor.";
    } finally {
      setButtonLoading(btn, false);
    }
  });

  function renderListaServicios(servicios) {
    var ul = document.getElementById("lista-servicios");
    if (!ul) return;
    ul.innerHTML = "";
    (servicios || []).forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = (s.nombre || "") + " — " + (s.precio != null ? s.precio : "");
      ul.appendChild(li);
    });
  }

  async function cargarServiciosEnSelect() {
    var sel = document.getElementById("select-servicio-mascota");
    if (!sel) return;
    var res = await fetch("/servicios");
    var data = await parseJsonResponse(res);
    var prev = sel.value;
    sel.querySelectorAll('option:not([value=""])').forEach(function (o) {
      o.remove();
    });
    (data && data.servicios ? data.servicios : []).forEach(function (s) {
      var opt = document.createElement("option");
      opt.value = s.nombre || "";
      opt.textContent = (s.nombre || "") + " (" + (s.precio != null ? s.precio : "?") + ")";
      sel.appendChild(opt);
    });
    if (prev) sel.value = prev;
  }

  document.getElementById("form-agregar-servicio")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = document.getElementById("btn-agregar-servicio");
    var out = document.getElementById("resultado-agregar-servicio");
    var nombre = document.getElementById("input-nombre-servicio").value.trim();
    var precio = Number(document.getElementById("input-precio-servicio").value);
    setButtonLoading(btn, true);
    out.textContent = "";
    try {
      var res = await fetch("/agregar-servicio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre, precio: precio }),
      });
      var data = await parseJsonResponse(res);
      out.textContent = data && data.mensaje ? data.mensaje : JSON.stringify(data);
      await cargarServiciosEnSelect();
    } catch (err) {
      out.textContent = "Error de red o del servidor.";
    } finally {
      setButtonLoading(btn, false);
    }
  });

  document.getElementById("btn-actualizar-servicios")?.addEventListener("click", async function () {
    var btn = document.getElementById("btn-actualizar-servicios");
    setButtonLoading(btn, true);
    try {
      var res = await fetch("/servicios");
      var data = await parseJsonResponse(res);
      renderListaServicios(data && data.servicios);
      await cargarServiciosEnSelect();
    } catch (err) {
      renderListaServicios([]);
    } finally {
      setButtonLoading(btn, false);
    }
  });

  document.getElementById("form-registrar-mascota")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = document.getElementById("btn-registrar-mascota");
    var out = document.getElementById("resultado-registrar-mascota");
    var correo = document.getElementById("input-correo-mascota").value.trim();
    var nombre_mascota = document.getElementById("input-nombre-mascota").value.trim();
    var tipo_servicio = document.getElementById("select-servicio-mascota").value;
    var fecha = document.getElementById("input-fecha-mascota").value;
    setButtonLoading(btn, true);
    out.textContent = "";
    try {
      var res = await fetch("/registrar-mascota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correo,
          nombre_mascota: nombre_mascota,
          tipo_servicio: tipo_servicio,
          fecha: fecha,
        }),
      });
      var data = await parseJsonResponse(res);
      out.textContent = data && data.mensaje ? data.mensaje : JSON.stringify(data);
    } catch (err) {
      out.textContent = "Error de red o del servidor.";
    } finally {
      setButtonLoading(btn, false);
    }
  });

  document.getElementById("form-buscar-mascotas")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = document.getElementById("btn-buscar-mascotas");
    var box = document.getElementById("resultado-busqueda-mascotas");
    var correo = document.getElementById("input-busqueda-mascotas-correo").value.trim();
    setButtonLoading(btn, true);
    box.innerHTML = "";
    try {
      var res = await fetch("/mascotas/" + encodeURIComponent(correo));
      var data = await parseJsonResponse(res);
      var pre = document.createElement("pre");
      pre.textContent = JSON.stringify(data, null, 2);
      box.appendChild(pre);
    } catch (err) {
      box.textContent = "Error de red o del servidor.";
    } finally {
      setButtonLoading(btn, false);
    }
  });

  document.getElementById("form-buscar-reporte")?.addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = document.getElementById("btn-buscar-reporte");
    var box = document.getElementById("resultado-reporte");
    var correo = document.getElementById("input-reporte-correo").value.trim();
    setButtonLoading(btn, true);
    box.innerHTML = "";
    try {
      var res = await fetch("/reporte/" + encodeURIComponent(correo));
      var data = await parseJsonResponse(res);
      var pre = document.createElement("pre");
      pre.textContent = JSON.stringify(data, null, 2);
      box.appendChild(pre);
    } catch (err) {
      box.textContent = "Error de red o del servidor.";
    } finally {
      setButtonLoading(btn, false);
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initLogout();
    applySessionToUI();
    cargarServiciosEnSelect().catch(function () {});
    document.getElementById("btn-actualizar-servicios")?.click();
  });
})();
