import React from "react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/footer";
import { Link } from "react-router-dom";

export const EditarCarritoProducto = () => {
    return (
        <div className="flex flex-col min-h-screen pt-[150px]">
            <Navbar />
            
            {/* Contenido principal del carrito */}
            <div className="container mx-auto px-4 pt-20 flex-1">
                <Link to='/carritodecompras' className="bg-gray-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-700 transition duration-300">
                    Regresar
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                    {/* Imagen */}
                    <div className="flex flex-col justify-center items-center md:items-start">
                        <h2 className="font-bold text-2xl mb-4">Tarjetas de presentación</h2>
                        <img className="max-w-sm w-[500px] h-[500px] rounded-xl shadow-lg transition-transform duration-300 hover:scale-105" src="https://assets.freelogoservices.com/sites/all/themes/freelogoservices/images/bcworkflow/bc_lp_grey_top_bkg.png" alt="Producto" />
                    </div>

                    {/* Formulario */}
                    <form className="text-black border-2 border-gray-300 p-6 rounded-xl w-full max-w-md flex flex-col gap-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="cantidad" className="font-semibold">Cantidad</label>
                            <input id="cantidad" type="number" className="w-full h-10 px-3 border border-gray-300 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="alto" className="font-semibold">Alto</label>
                            <input id="alto" type="number" className="w-full h-10 px-3 border border-gray-300 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="ancho" className="font-semibold">Ancho</label>
                            <input id="ancho" type="number" className="w-full h-10 px-3 border border-gray-300 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="descripcion" className="font-semibold">Descripción</label>
                            <textarea id="descripcion" rows={4} className="w-full px-3 border border-gray-300 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="urlImagen" className="font-semibold">URL Imagen</label>
                            <input id="urlImagen" type="text" className="w-full h-10 px-3 border border-gray-300 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <Link to='/carritodecompras' className="bg-black text-white p-3 rounded-xl hover:bg-gray-900 font-bold transition duration-300 text-center">
                            Editar
                        </Link>
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    )
}

