import $ from 'jquery';
import 'jquery-ui/ui/widgets/dialog';

document.addEventListener("DOMContentLoaded", function() {
    // Inicializar el diálogo cuando el DOM esté completamente cargado
    $("#dialog").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Ok": function() {
                $(this).dialog("close");
            }
        }
    });

    // Crear y añadir el botón al DOM
    const button = document.createElement('button');
    button.textContent = 'Click me';
    document.body.appendChild(button);

    // Añadir el evento click al botón para abrir el diálogo
    button.addEventListener('click', function() {
        $("#dialog").dialog("open");
    });
});
