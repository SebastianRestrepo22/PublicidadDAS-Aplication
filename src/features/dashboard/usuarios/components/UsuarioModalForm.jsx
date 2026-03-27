import React from "react";
import Modal from "../../components/modals/modal.jsx";

export const UsuarioModalForm = ({
  open,
  onClose,
  title,
  values,
  submitted,
  cargandoFormulario,
  tiposDocumento,
  roles,
  handleChanges,
  handleCorreoBlur,
  handleCedulaBlur,
  handleTelefonoBlur,
  handleSubmit,
  correoError,
  cedulaError,
  telefonoError,
  cedulaFormatoError,
  telefonoFormatoError,
  nombreError,
  resetForm
}) => {
  const isReadOnly = false; // nunca es solo lectura en este modal
  const buttonLabel = title.includes("Nuevo") ? "Crear" : "Guardar";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[450px] p-6 mx-auto text-center">
        <h3 className="text-lg font-black text-gray-800 mb-6">{title}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-left">
          {/* Tipo de documento */}
          <div className="flex flex-col">
            <label className="mb-1">Tipo de documento</label>
            <select
              name="TipoDocumentoId"
              value={values.TipoDocumentoId || ""}
              onChange={handleChanges}
              disabled={cargandoFormulario}
              className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                ${submitted && !values.TipoDocumentoId ? "border-red-500" : "border-gray-300"} ${cargandoFormulario ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">Seleccione un tipo de documento</option>
              {tiposDocumento.map((tipo) => (
                <option key={tipo.TipoDocumentoId} value={tipo.TipoDocumentoId}>
                  {tipo.Nombre}
                </option>
              ))}
            </select>
            <div className="min-h-[16px] mt-0.5">
              {(!values.TipoDocumentoId && submitted) && (
                <p className="text-red-500 text-[12px] leading-4">Campo obligatorio.</p>
              )}
            </div>
          </div>

          {/* Cédula */}
          <div className="flex flex-col">
            <label className="mb-1">Cédula *</label>
            <input
              type="text"
              name="CedulaId"
              value={values.CedulaId}
              placeholder="Ingrese su cédula (6-10 dígitos)"
              readOnly={title.includes("Editar")} // readonly en edición
              disabled={cargandoFormulario}
              onChange={handleChanges}
              onBlur={handleCedulaBlur}
              maxLength="10"
              className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                ${(submitted && !values.CedulaId.trim()) || cedulaError || cedulaFormatoError ? "border-red-500" : "border-gray-300"} ${(title.includes("Editar") || cargandoFormulario) ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            <div className="min-h-[32px] mt-0.5">
              {(!values.CedulaId.trim() && submitted) ? (
                <p className="text-red-500 text-[12px] leading-4">Ingrese una cédula válida</p>
              ) : cedulaError ? (
                <p className="text-red-500 text-[12px] leading-4">{cedulaError}</p>
              ) : cedulaFormatoError ? (
                <p className="text-red-500 text-[12px] leading-4">{cedulaFormatoError}</p>
              ) : values.CedulaId ? (
                <p className="text-gray-500 text-[11px] leading-4">
                  {values.CedulaId.length}/10 dígitos • Solo números permitidos
                </p>
              ) : null}
            </div>
          </div>

          {/* Nombre */}
          <div className="flex flex-col">
            <label className="mb-1">Nombre completo *</label>
            <input
              type="text"
              name="NombreCompleto"
              value={values.NombreCompleto}
              placeholder="Ingrese su nombre (solo letras)"
              readOnly={false}
              disabled={cargandoFormulario}
              onChange={handleChanges}
              className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                ${(submitted && !values.NombreCompleto.trim()) || nombreError ? "border-red-500" : "border-gray-300"} ${cargandoFormulario ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            <div className="min-h-[32px] mt-0.5">
              {(!values.NombreCompleto.trim() && submitted) ? (
                <p className="text-red-500 text-[12px] leading-4">Ingrese su nombre completo</p>
              ) : nombreError ? (
                <p className="text-red-500 text-[12px] leading-4">{nombreError}</p>
              ) : values.NombreCompleto ? (
                <p className="text-gray-500 text-[11px] leading-4">
                  {values.NombreCompleto.length} caracteres • Solo letras permitidas
                </p>
              ) : null}
            </div>
          </div>

          {/* Dirección */}
          <div className="flex flex-col">
            <label className="mb-1">Dirección</label>
            <input
              type="text"
              name="Direccion"
              value={values.Direccion}
              placeholder="Ingrese su dirección"
              readOnly={false}
              disabled={cargandoFormulario}
              onChange={handleChanges}
              className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                ${submitted && !values.Direccion.trim() ? "border-red-500" : "border-gray-300"} ${cargandoFormulario ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            <div className="min-h-[16px] mt-0.5">
              {(!values.Direccion.trim() && submitted) && (
                <p className="text-red-500 text-[12px] leading-4">Ingrese una dirección</p>
              )}
            </div>
          </div>

          {/* Correo */}
          <div className="flex flex-col">
            <label className="mb-1">Correo electrónico</label>
            <input
              type="email"
              name="CorreoElectronico"
              value={values.CorreoElectronico}
              placeholder="ejemplo@correo.com"
              readOnly={false}
              disabled={cargandoFormulario}
              onChange={handleChanges}
              onBlur={handleCorreoBlur}
              className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                ${(submitted && !values.CorreoElectronico.trim()) || correoError ? "border-red-500" : "border-gray-300"} ${cargandoFormulario ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            <div className="min-h-[16px] mt-0.5">
              {(!values.CorreoElectronico.trim() && submitted) ? (
                <p className="text-red-500 text-[12px] leading-4">Ingrese un correo válido</p>
              ) : correoError ? (
                <p className="text-red-500 text-[12px] leading-4">{correoError}</p>
              ) : null}
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex flex-col">
            <label className="mb-1">Teléfono *</label>
            <input
              type="text"
              name="Telefono"
              value={values.Telefono}
              placeholder="Ej: 3001234567 (10 dígitos)"
              readOnly={false}
              disabled={cargandoFormulario}
              onChange={handleChanges}
              onBlur={handleTelefonoBlur}
              maxLength="10"
              className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                ${(submitted && !values.Telefono.trim()) || telefonoError || telefonoFormatoError ? "border-red-500" : "border-gray-300"} ${cargandoFormulario ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            <div className="min-h-[32px] mt-0.5">
              {(!values.Telefono.trim() && submitted) ? (
                <p className="text-red-500 text-[12px] leading-4">Ingrese un número de teléfono</p>
              ) : telefonoError ? (
                <p className="text-red-500 text-[12px] leading-4">{telefonoError}</p>
              ) : telefonoFormatoError ? (
                <p className="text-red-500 text-[12px] leading-4">{telefonoFormatoError}</p>
              ) : values.Telefono ? (
                <p className="text-gray-500 text-[11px] leading-4">
                  {values.Telefono.length}/10 dígitos • Solo números permitidos
                  {values.Telefono.length === 10 && " ✓ Formato válido"}
                </p>
              ) : null}
            </div>
          </div>

          {/* Rol */}
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="mb-1">Rol</label>
            <select
              name="RoleId"
              value={values.RoleId || ""}
              onChange={handleChanges}
              disabled={cargandoFormulario}
              className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                ${submitted && !values.RoleId ? "border-red-500" : "border-gray-300"} ${cargandoFormulario ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">Seleccione un rol</option>
              {roles.map((rol) => (
                <option key={rol.RoleId} value={rol.RoleId}>
                  {rol.Nombre}
                </option>
              ))}
            </select>
            <div className="min-h-[16px] mt-0.5">
              {(!values.RoleId && submitted) && (
                <p className="text-red-500 text-[12px] leading-4">Seleccione un rol</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="col-span-1 md:col-span-2 flex gap-4 mt-3">
            <button
              type="submit"
              disabled={cargandoFormulario}
              className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2
                ${cargandoFormulario ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              {cargandoFormulario ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                buttonLabel
              )}
            </button>
            <button
              type="button"
              disabled={cargandoFormulario}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};