import { useState, useEffect } from "react";
import { getAllCategorias } from "../../categoriadediseño/services/services.categoria.js";

export const useCategorias = (values, setValues) => {
    const [categorias, setCategorias] = useState([]);
    const [openCategoriasModal, setOpenCategoriasModal] = useState(false);
    const [categoriaBusqueda, setCategoriaBusqueda] = useState("");
    const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);

    useEffect(() => {
        const fetchCategoria = async () => {
            const data = await getAllCategorias();
            if (data?.data) {
                setCategorias(data.data);
                setCategoriasFiltradas(data.data);
            }
        };
        fetchCategoria();
    }, []);

    useEffect(() => {
        if (categoriaBusqueda.trim() === "") {
            setCategoriasFiltradas(categorias);
        } else {
            const filtradas = categorias.filter(categoria =>
                categoria.Nombre.toLowerCase().includes(categoriaBusqueda.toLowerCase()) ||
                categoria.CategoriaId.toLowerCase().includes(categoriaBusqueda.toLowerCase())
            );
            setCategoriasFiltradas(filtradas);
        }
    }, [categoriaBusqueda, categorias]);

    const seleccionarCategoria = (categoria) => {
        setValues({ ...values, CategoriaId: categoria.CategoriaId });
        setOpenCategoriasModal(false);
        setCategoriaBusqueda("");
    };

    const obtenerNombreCategoria = (categoriaId) => {
        const categoria = categorias.find(c => c.CategoriaId === categoriaId);
        return categoria ? categoria.Nombre : "Seleccione la categoría";
    };

    return {
        categorias,
        openCategoriasModal,
        setOpenCategoriasModal,
        categoriaBusqueda,
        setCategoriaBusqueda,
        categoriasFiltradas,
        seleccionarCategoria,
        obtenerNombreCategoria
    };
};