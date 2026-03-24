document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addNewsForm');

    function setError(id, message) {
        const el = document.getElementById('error-' + id);
        if (el) el.textContent = message || '';
    }

    function clearErrors() {
        ['title','author','date','time','category','image','summary','content'].forEach(id => setError(id, ''));
    }

    function isFutureDate(d) {
        if (!d) return false;
        const input = new Date(d);
        const now = new Date();
        // compare only dates (ignore time)
        input.setHours(0,0,0,0);
        now.setHours(0,0,0,0);
        return input > now;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors();
        let valid = true;

        // Title: min 5 chars
        const title = form.title.value.trim();
        if (title.length < 5) {
            setError('title', 'Заголовок должен содержать не менее 5 символов.');
            valid = false;
        }

        // Author: letters and spaces only, must be two words (name + surname)
        const author = form.author.value.trim();
        const authorRe = /^[A-Za-zА-Яа-яЁё]+\s+[A-Za-zА-Яа-яЁё]+(\s+[A-Za-zА-Яа-яЁё]+)?$/;
        if (!authorRe.test(author)) {
            setError('author', 'Введите имя и фамилию, только буквы и пробелы.');
            valid = false;
        }

        // Date: not in future
        const dateVal = form.date.value;
        if (dateVal && isFutureDate(dateVal)) {
            setError('date', 'Дата не может быть в будущем.');
            valid = false;
        }

        // Read time: integer 1..300
        const timeVal = form.readtime.value;
        const timeNum = parseInt(timeVal, 10);
        if (!timeVal || isNaN(timeNum) || timeNum < 1 || timeNum > 300) {
            setError('time', 'Время чтения должно быть целым числом от 1 до 300.');
            valid = false;
        }

        // Category must be selected
        const cat = form.category.value;
        if (!cat) {
            setError('category', 'Выберите категорию.');
            valid = false;
        }

        // Image: if provided must be jpeg/png and <= 2MB
        const fileInput = form.image;
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const allowed = ['image/jpeg','image/png'];
            if (!allowed.includes(file.type)) {
                setError('image', 'Недопустимый формат файла.');
                valid = false;
            } else if (file.size > 2 * 1024 * 1024) {
                setError('image', 'Файл слишком большой (макс. 2 МБ).');
                valid = false;
            }
        }

        // Summary: min 20 chars
        const summary = form.summary.value.trim();
        if (summary.length < 20) {
            setError('summary', 'Краткое описание должно содержать не менее 20 символов.');
            valid = false;
        }

        // Content: min 50 chars and must contain at least one letter
        const content = form.content.value.trim();
        if (content.length < 50 || !/[A-Za-zА-Яа-яЁё]/.test(content)) {
            setError('content', 'Полный текст должен содержать не менее 50 символов и хотя бы одну букву.');
            valid = false;
        }

        if (valid) {
            // For demo: show success message but do not submit to server
            alert('Форма успешно проверена.');
            form.reset();
            clearErrors();
        } else {
            // Keep form visible; errors shown under fields. Do not change layout.
            const firstError = document.querySelector('.error:empty ~ .error, .error');
            // Optionally focus first invalid input
            const invalid = document.querySelector('.error:not(:empty)');
            if (invalid) {
                const id = invalid.id.replace('error-','');
                const input = document.getElementById('news-' + id) || document.getElementById('news-' + id) || document.getElementById('news-' + id);
                // fallback: find input/select/textarea with matching name
                if (input) input.focus();
            }
        }
    });
});
