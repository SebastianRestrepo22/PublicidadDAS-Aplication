import { Briefcase, Users, Award, MapPin, DollarSign, Box } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer"
import { History, Target, Eye } from "lucide-react";

export const QuienesSomos = () => {
    return (
        <>
            <Navbar />

            <section className="bg-white py-20 px-8 lg:px-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            PublicidadDAS
                        </h1>
                        <div className="w-20 h-1 bg-blue-900 mb-6"></div>
                        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                            Somos un espacio dedicado a ofrecer productos y servicios de papelería que facilitan el estudio, 
                            el trabajo y la organización diaria. Nuestro objetivo es brindar soluciones prácticas para estudiantes, 
                            profesionales y empresas que necesitan materiales confiables para sus actividades.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                          En nuestra papelería encontrarás una variedad de útiles escolares, 
                          material de oficina y servicios como impresiones, copias y encuadernación. 
                          Trabajamos para ofrecer atención cercana, productos de calidad y precios accesibles que se adapten 
                          a las necesidades de cada cliente.
                        </p>
                    </div>

                    <div className="relative w-full h-[450px]">
                        <img
                            src="public/multimedia/image2.jpg"
                            alt="imagen2"
                            className="absolute top-0 right-0 w-[75%] h-[320px] object-cover rounded-2xl shadow-xl transform transition duration-500 hover:scale-105"
                        />
                        <img
                            src="public/multimedia/image3.jpg"
                            alt="imagen3"
                            className="absolute bottom-0 left-0 w-[70%] h-[280px] object-cover rounded-2xl shadow-xl transform transition duration-500 hover:scale-105"
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section - Fondo Blanco */}
            <section className="bg-white py-16 px-8 lg:px-20">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                    Nuestra Fortaleza
                </h2>
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-blue-50 rounded-full text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
                                <Box className="w-8 h-8" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Variedad</h3>
                        <p className="text-gray-600 font-medium">Amplia variedad de productos</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-blue-50 rounded-full text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
                                <Award className="w-8 h-8" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Calidad en cada servicio</h3>
                        <p className="text-gray-600 font-medium">Calidad en cada servicio</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-blue-50 rounded-full text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
                                <MapPin className="w-8 h-8" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Atención</h3>
                        <p className="text-gray-600 font-medium">Atención cercana</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-blue-50 rounded-full text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
                                <DollarSign className="w-8 h-8" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Accesible</h3>
                        <p className="text-gray-600 font-medium">Precios Justos</p>
                    </div>
                </div>
            </section>

            {/* Experience Gallery - Fondo Blanco */}
            <section className="bg-white py-16 px-8 lg:px-20">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
                    Nuestra Experiencia
                </h2>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                    Comprometidos con brindar soluciones prácticas para el estudio, el trabajo y la organización diaria.
                </p>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative overflow-hidden rounded-2xl shadow-xl group">
                        <img
                            src="/multimedia/experiencia-1.png"
                            alt="experiencia 1"
                            className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl shadow-xl group">
                        <img
                            src="/multimedia/experiencia-2.jpg"
                            alt="experiencia 2"
                            className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                </div>
            </section>

            {/* Mission, Vision, History - Fondo Gris con Borde Azul Oscuro */}
            <section className="w-full bg-gray-100 py-16 px-8 lg:px-20">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                    Conócenos un poco más
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {/* Historia */}
                    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
                        <div className="flex justify-center mb-4">
                            <History className="w-12 h-12 text-pink-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">HISTORIA</h3>
                        <p className="text-gray-600">
                            Nuestra historia nace con la idea de ofrecer un espacio donde las personas puedan encontrar
                            todo lo necesario para el estudio, el trabajo y la organización diaria. Con el tiempo, las
                            papelerías se han convertido en un apoyo importante para estudiantes, profesionales y empresas
                            que buscan materiales y servicios confiables para sus actividades.
                        </p>
                    </div>

                    {/* Misión */}
                    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
                        <div className="flex justify-center mb-4">
                            <Target className="w-12 h-12 text-pink-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">MISIÓN</h3>
                        <p className="text-gray-600">
                            Ofrecer productos de papelería y servicios de impresión que ayuden a estudiantes,
                            profesionales y empresas a desarrollar sus actividades con mayor facilidad,
                            garantizando calidad, buena atención y precios accesibles.
                        </p>
                    </div>

                    {/* Visión */}
                    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
                        <div className="flex justify-center mb-4">
                            <Eye className="w-12 h-12 text-pink-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">VISIÓN</h3>
                        <p className="text-gray-600">
                            Ser un referente confiable en productos y servicios de papelería, destacándonos por
                            nuestra variedad, atención al cliente y compromiso con brindar soluciones útiles
                            para el estudio, el trabajo y los proyectos personales.
                        </p>
                    </div>
                </div>
            </section>



            <Footer />
        </>
    );
};