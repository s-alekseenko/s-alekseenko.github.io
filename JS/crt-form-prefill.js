const crtFormPrefill = (() => {
	class CrtFormPrefill {
		_token;

		/**
		 * Form prefill service URL.
		 * @returns {String}
		 */
		prefillServiceUrl;

		/**
		 * Form prefill token.
		 * @returns {String}
		 */
		get token() {
			return this._token;
		}

		/**
		 * Initializes access token to get form prefill data.
		 */
		init() {
			this._token = this.getURLParameter('crt_pref');
		}

		/**
		 * Returns URL parameter by name.
		 * @param {String} name Parameter name.
		 * @return {String}
		 */
		getURLParameter(name) {
			return decodeURIComponent(
				(RegExp('[?|&]' + name + '=' + '(.+?)(&|$)', 'i').exec(location.search) || [, ""])[1]
			);
		}

		notMinValue(value) {
			return value !== '0001-01-01';
		}

		/**
		 * Sets field values in the form.
		 * @param {Object} formEl Form element.
		 * @param {Object} fieldValues Field values to set.
		 */
		setFieldValues(formEl, fieldValues) {
			formEl.querySelectorAll('.bee-field input').forEach(field => {
				let value = fieldValues[field.name];
				if (field.type === 'date') {
					const date = new Date(value);
					const formattedDate = date.toISOString().slice(0, 10);
					if (notMinValue(formattedDate)) {
						value = formattedDate;
					}
				}
				field.value = value ?? '';
			});
			formEl.querySelectorAll('.bee-field select').forEach(field => {
				const value = fieldValues[field.name];
				field.value = value ?? '';
			});
		}

		/**
		 * Fetches form prefill data from the service.
		 * @returns
		 */
		async getData() {
			const requestUrl = `${this.prefillServiceUrl}/api/prefill/get`;
			return fetch(requestUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ token: this.token })
			}).then(response => response.ok ? response.json() : response.text());
		};
	}
	return new CrtFormPrefill();
})();

const ready = fn => document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);

ready(async () => {
	crtFormPrefill.init();
	if (!crtFormPrefill.token) {
		return;
	}
	const pageForms = Array.from(document.getElementsByTagName('form'));
	if (pageForms.length < 1) {
		return;
	}
	const fieldValues = await crtFormPrefill.getData();
	if (fieldValues) {
		pageForms.forEach(f => crtFormPrefill.setFieldValues(f, fieldValues));
	}
});

window.crtFormPrefill = crtFormPrefill;
