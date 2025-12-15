// main.js
document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;

    // ===== БУРГЕР-МЕНЮ =====
    var burgerOpenBtn = document.querySelector("[data-burger]");
    var burgerCloseBtn = document.querySelector("[data-burger-close]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    function openMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add("mobile-menu--open");
        body.classList.add("no-scroll");
    }

    function closeMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove("mobile-menu--open");
        body.classList.remove("no-scroll");
    }

    if (burgerOpenBtn) {
        burgerOpenBtn.addEventListener("click", function () {
            if (mobileMenu && mobileMenu.classList.contains("mobile-menu--open")) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    if (burgerCloseBtn) {
        burgerCloseBtn.addEventListener("click", function () {
            closeMobileMenu();
        });
    }

    if (mobileMenu) {
        mobileMenu.addEventListener("click", function (e) {
            if (e.target.tagName === "A") {
                closeMobileMenu();
            }
        });
    }

    window.addEventListener("resize", function () {
        if (window.innerWidth > 1200) {
            closeMobileMenu();
        }
    });

    // ===== ПОДСВЕТКА АКТИВНОГО ПУНКТА МЕНЮ =====
    var navLinks = document.querySelectorAll(".site-header__nav a, .mobile-menu__nav a");

    if (navLinks.length) {
        var path = window.location.pathname;
        var file = path.split("/").pop();
        if (!file || file === "/") {
            file = "index.html";
        }

        navLinks.forEach(function (link) {
            var href = link.getAttribute("href");
            if (!href) return;
            var linkFile = href.split("/").pop();
            if (linkFile === file) {
                link.classList.add("is-active");
            }
        });
    }

    // ===== МОДАЛКА ЗАЯВКИ =====
    var leadModal = document.getElementById("lead-modal");
    if (!leadModal) {
        return;
    }

    var leadBackdrop = leadModal.querySelector(".lead-modal__backdrop");
    var leadCloseBtn = leadModal.querySelector("[data-close-lead]");
    var tabButtons = leadModal.querySelectorAll("[data-lead-tab-target]");
    var forms = leadModal.querySelectorAll("[data-lead-tab]");
    var openButtons = document.querySelectorAll("[data-open-lead]");

    function setActiveTab(tabName) {
        tabButtons.forEach(function (btn) {
            var target = btn.getAttribute("data-lead-tab-target");
            if (target === tabName) {
                btn.classList.add("lead-tab--active");
            } else {
                btn.classList.remove("lead-tab--active");
            }
        });

        forms.forEach(function (form) {
            var tab = form.getAttribute("data-lead-tab");
            if (tab === tabName) {
                form.classList.remove("hidden");
            } else {
                form.classList.add("hidden");
            }
        });
    }

    function openLeadModal(initialTab) {
        body.classList.add("no-scroll");
        leadModal.classList.add("lead-modal--open");
        setActiveTab(initialTab || "client");
    }

    function closeLeadModal() {
        body.classList.remove("no-scroll");
        leadModal.classList.remove("lead-modal--open");
    }

    openButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var tab = btn.getAttribute("data-lead-tab") || "client";
            openLeadModal(tab);
        });
    });

    if (leadBackdrop) {
        leadBackdrop.addEventListener("click", function () {
            closeLeadModal();
        });
    }

    if (leadCloseBtn) {
        leadCloseBtn.addEventListener("click", function () {
            closeLeadModal();
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && leadModal.classList.contains("lead-modal--open")) {
            closeLeadModal();
        }
    });

    tabButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var target = btn.getAttribute("data-lead-tab-target");
            setActiveTab(target);
        });
    });

    // ===== МАСКА ТЕЛЕФОНА: +7 и максимум 10 цифр =====
    var phoneInputs = document.querySelectorAll("input[data-phone-input]");

    phoneInputs.forEach(function (input) {
        // ввод — приводим к формату +7XXXXXXXXXX
        input.addEventListener("input", function () {
            var digits = input.value.replace(/\D/g, ""); // только цифры

            if (!digits) {
                // поле полностью стёрли
                input.value = "";
                return;
            }

            // если первая цифра 7 — считаем её кодом страны и убираем
            if (digits[0] === "7") {
                digits = digits.slice(1);
            }

            // если после этого цифр нет — очищаем поле (убираем +7)
            if (!digits) {
                input.value = "";
                return;
            }

            // максимум 10 цифр после +7
            digits = digits.slice(0, 10);
            input.value = "+7" + digits;
        });

        // backspace по +7 очищает поле
        input.addEventListener("keydown", function (e) {
            if (e.key === "Backspace") {
                if (input.value === "+7" &&
                    input.selectionStart === 2 &&
                    input.selectionEnd === 2) {
                    input.value = "";
                    e.preventDefault();
                }
            }
        });
    });

    // ===== КАСТОМНАЯ ВАЛИДАЦИЯ ФОРМЫ =====
    var leadForms = leadModal.querySelectorAll(".js-lead-form");

    function clearFormErrors(form) {
        form.querySelectorAll(".form-error").forEach(function (el) {
            el.remove();
        });
        form.querySelectorAll(".form-control, .form-textarea, .form-select").forEach(function (field) {
            field.classList.remove("form-control--error", "form-textarea--error", "form-select--error");
        });
    }

    function showFieldError(field, message) {
        var container = field.closest(".lead-form__footer") || field.parentNode;
        var errorEl = document.createElement("div");
        errorEl.className = "form-error";
        errorEl.textContent = message;

        if (field.classList.contains("form-textarea")) {
            field.classList.add("form-textarea--error");
        } else if (field.classList.contains("form-select")) {
            field.classList.add("form-select--error");
        } else {
            field.classList.add("form-control--error");
        }

        container.appendChild(errorEl);
    }

    function getErrorText(field) {
        var name = field.getAttribute("name") || field.id || "";
        switch (name) {
            case "fio":
                return "Напишите, как к вам обращаться.";
            case "task":
                return "Кратко опишите задачу.";
            case "name":
                return "Напишите ваше имя.";
            case "city":
                return "Выберите город.";
            case "status":
                return "Выберите ваш статус.";
            case "direction":
                return "Укажите направление.";
            case "about":
                return "Расскажите пару слов о себе.";
            case "phone":
                return "Укажите номер телефона.";
            default:
                return "Заполните это поле.";
        }
    }

    function validateForm(form) {
        clearFormErrors(form);
        var valid = true;

        var requiredFields = form.querySelectorAll("[required]");
        requiredFields.forEach(function (field) {
            // чекбокс согласия
            if (field.type === "checkbox") {
                if (!field.checked) {
                    showFieldError(field, "Чтобы отправить форму, нужно согласиться с обработкой данных.");
                    valid = false;
                }
                return;
            }

            var value = field.value.trim();

            // поле телефона
            if (field.hasAttribute("data-phone-input")) {
                var digits = field.value.replace(/\D/g, "");
                if (!digits) {
                    showFieldError(field, "Укажите номер телефона.");
                    valid = false;
                    return;
                }
                // +7 и ещё 10 цифр => всего 11
                if (digits.length < 11) {
                    showFieldError(field, "Введите номер полностью.");
                    valid = false;
                }
                return;
            }

            if (!value) {
                showFieldError(field, getErrorText(field));
                valid = false;
            }
        });

        return valid;
    }

    // ===== ОТПРАВКА ЗАЯВКИ В /api/lead =====
    async function sendLeadToServer(form) {
        var type = form.getAttribute("data-lead-tab"); // client / career
        var formData = new FormData(form);
        var payload = { type: type };

        formData.forEach(function (value, key) {
            payload[key] = value;
        });

        try {
            var response = await fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Network error");
            }

            var data = await response.json();
            if (!data.ok) {
                throw new Error("Telegram error");
            }

            alert("Спасибо! Ваша заявка отправлена.");
            form.reset();
            clearFormErrors(form);
            closeLeadModal();
        } catch (err) {
            console.error(err);
            alert("Ошибка при отправке. Попробуйте ещё раз или позвоните по телефону 8 800 200 8089.");
        }
    }

    leadForms.forEach(function (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (validateForm(form)) {
                sendLeadToServer(form);
            }
        });
    });
});