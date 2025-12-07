
import { Briefcase } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer"

export const QuienesSomos = () => {
    return (
        <>

            <Navbar />
            <section className="w-full">
                <div className="relative w-full h-[220px] ">
                    <img src="public/multimedia/quienessomos2.jpg" alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <h2 className="text-white text-3xl font-bold">Haz tangible lo que se te pase por tu mente </h2>
                    </div>
                </div>
            </section>

            <section className="bg-white py-16 px-8 lg:px-20 pb-40">


                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-6xl font-bold text-black-600 mb-4">
                            PublicidadDAS
                        </h3>
                        <p className="text-gray-800 mb-4">
                            Somos una empresa experta en darte lo mejor para cada una de tus necesidades
                            estamos dispuesto a que estes siempre agusto con nosotros y mejores la calidad
                            y la experiencia al trabajar con nosotros .
                        </p>
                        <p className="text-gray-900 mb-4">
                            Calidad es la que buscas ,siempre estamos disponibles para ti para que podamos
                            complacer cada necesidad que te haga falta en todo lo necesario , haremos una realidad
                            virtual , en realidad tangible .
                        </p>
                    </div>

                    <div className="relative w-full h-[400px]">
                        <img
                            src="public/multimedia/image2.jpg"
                            alt="imagen2"
                            className="absolute top-0 right-0 w-[80%] h-[500px] object-cover rounded-xl shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl "
                        />
                        <img
                            src="public/multimedia/image3.jpg"
                            alt="imagen3"
                            className="absolute bottom-0 left-0 w-[70%] h-[300px] object-cover   rounded-xl shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                        />
                    </div>
                </div>
            </section>

            <section className="w-full bg-white-50 py-12 px-6 lg:px-20">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10">
                    Estrategia Positiva
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="bg-card p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 text-center group">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-card-foreground mb-3">
                            Clientes Satisfechos
                        </h3>
                        <p className="text-muted-foreground">
                            Mas de 300 clientes satisfechos
                        </p>
                    </div>

                    <div className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-4 text-center group">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-card-foreground mb-3">
                            Calidad de Servicio
                        </h3>
                        <p className="text-muted-foreground">
                            Excelente servicio
                        </p>
                    </div>

                    <div className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-4 text-center group">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:bg-blue-900 group-hover:text-primary-white transition-colors duration-300">
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-card-foreground mb-3">
                            Tienda Fisica
                        </h3>
                        <p className="text-muted-foreground">
                            Itagui es nuestro centro
                        </p>
                    </div>

                    <div className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-4 text-center group">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:bg-blue-900 group-hover:text-primary-white transition-colors duration-300">
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-card-foreground mb-3">
                            Servicios a buen precio
                        </h3>
                        <p className="text-muted-foreground">
                            Buenos benefcios con nosotros
                        </p>
                    </div>

                </div>
            </section>

            <section className="w-full bg-white py-12 px-6 lg:px-20">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10">
                    Nuestra experiencia
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <img 
                    src="/multimedia/experiencia-1.png" 
                    alt="experiencia 1" 
                    className="w-full h-64 object-cover rounded-lg shadow-lg transition-transform duration-500 hover:scale-105"
                    />

                    <img 
                    src="/multimedia/experiencia-2.jpg" 
                    alt="experiencia 2" 
                    className="w-full h-64 object-cover rounded-lg shadow-lg transition-transform duration-500 hover:scale-105"
                    />

                    <img 
                    src="/multimedia/experiencia-3.jpeg" 
                    alt="experiencia 3" 
                    className="w-full h-64 object-cover rounded-lg shadow-lg transition-transform duration-500 hover:scale-105"
                    />

                    <img 
                    src="/multimedia/experiencia-4.jpeg" 
                    alt="experiencia 4" 
                    className="w-full h-64 object-cover rounded-lg shadow-lg transition-transform duration-500 hover:scale-105"
                     />

                </div>
                
            </section>


            <section className="w-full bg-grey py-16 px-8 lg:px-20">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                    Conocenos un poco mas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
                        <div className="flex justify-center mb-4">
                            <svg
                                className="w-12 h-12 text-pink-600"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"

                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            HISTORIA
                        </h3>
                        <p className="text-gray-600">
                            Design and Style es una microempresa de litografía ubicada en Itagüí, con más de 4 años en
                            el mercado. Ofrece servicios de impresión en papel, gran formato y personalización de productos
                            para clientes individuales y empresas. Se apoya en canales digitales y
                            una empresa asociada para gestionar sus pedidos de forma eficiente.
                            <span className="font-semibold">TENDENCIA</span> de tu mejor negocio
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
                        <div className="flex justify-center mb-4">
                            <svg
                                className="w-12 h-12 text-pink-600"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            MISION
                        </h3>
                        <p className="text-gray-900">
                            En Design and Style nos dedicamos a ofrecer soluciones de impresión y personalización de alta calidad,
                            adaptadas a las necesidades tanto de clientes individuales como corporativos. Nuestro compromiso es brindar
                            una experiencia ágil, moderna y cercana, utilizando herramientas digitales para facilitar y garantizar resultados visuales
                            que superen las expectativas.

                            <span className="font-semibold">Confianza</span>
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
                        <div className="flex justify-center mb-4">
                            <svg
                                className="w-12 h-12 text-pink-600"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            VISION
                        </h3>
                        <p className="text-gray-600">
                            Aspiramos a consolidarnos como una empresa líder en servicios de impresión personalizada
                            de Medellín, reconocida por su innovación, eficiencia y enfoque centrado en el cliente. Buscamos evolucionar continuamente, integrando nuevas tecnologías,
                            nuestros canales de atención y métodos de pago, para ofrecer soluciones
                            efectivas que fortalezcan la identidad visual de nuestros clientes.

                        </p>
                    </div>
                </div>

            </section>

            <Footer />
        </>
    );
};
