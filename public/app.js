$(document).ready(function () {

    $(document).on('click', '.saveArticle', function () {
        const id = $(this).data("id");
        console.log(id);

        // Now make an ajax call for the Article
        $.ajax({
            method: "GET",
            url: "/article/" + id
        })
    });
});