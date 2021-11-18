const SPREADSHEET_CREDENTIALS = {
    "type": "service_account",
    "project_id": "trivia-app-198811",
    "private_key_id": "96428e961d0a747d47ead7dfc0bea053e4569e85",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCbvttd0oUNEkcT\nmgvxgU4uLSjQSbdS09zQffIC7yqjmDGObRiy+pf8UwqPe4R5xFe1WYOJlLtSdC+/\nW0c36dR6StmrsIUZpUPehJpGODQUpEDGj5cb4Afata6abogYxMkznmody/paycSM\n25X83/sAR6Efgsfa228qIh9u/Vuy5BBANQbRIz90ku69B7yUb3cuO7Vj1nZfQGZr\nlwtbp9Z+VOkF2doy4vep7uAgSiFH1xJoWLPh2u+yDkiSYCAXzozYZirP94Zuyaf5\nolA1ufqs0mIhDb4Dbm921cRqx0OMjFRB/zZ+rSHU12lJkKuaxUV8j4VATc2mgOS9\n5ncJXfR/AgMBAAECggEAF1LdOi85MqxujX5v1HJ3WU31A0BO3m4Q7v41fIABpC86\nGKi43rDNiwGKntMyEyQ2uFdX7gYiiWYR8nfCchqn8cp8z4vnWuBXih7Ulbh8AC1a\n8AF38To7IuM7azArXH433W2XWa/+5ZK6xxdpXk3SooeXlwb4VAuxmZ8zkuUJUwA9\nlJ0BURzyMhTOnRwrXbBKWdhKg9tKgDi1TvtXlAhJS6JPlbjbMMKNZ8mqjYnJqt/k\nAJVAZXfCFjCfhMrAMWHY6GAjAL4SINQfpboglzu7ZC+9bfjyPYHjwMBrNUFyMKae\n8ZGW0YmBVH0BY7cHFdEHGUCeCbtpXp7dHEuyuZeB6QKBgQDSngPjcSWfS+Bn56Ae\nPe2eqNJqU9pi+Fyatx6+v2SbU2/MIucWtV7SFDCvYFR5E7Fvv9T5LcBm67m8L8S2\nGRMqa8p/8d5PTNva+Otn33tkWna1uy5PqDVAcpFs2E/K2r89slHhTpiMecQTZjlK\nOMIdRX9LQ42k7i0c0xA+T4hJmQKBgQC9Tge4BhX62hFIxOzoWsSRN6bQzbXtTl2U\nmQ1Gj+2xkHMe5OSg4xSU9EGDhYkx7Ba+pZzV5zytNxktE7WdnI0hVtcGQWktxWPO\nBiH8jjZGt0XqnY1QRRMliBBvrp7EqUbRqziE56nGA+8EVMTmD/0bm/nneZbaRaFm\nhBxLmmJt1wKBgQCGyvhkHKreWzpAZX4VPL8R1qvrvsS6qIbjwaScoXMq8WhQdln9\nL5CC1Mcfxn/piU/63APagYxskhqptMypWjzo3lmYLtx/VgozBzHppZ6b6EWnIyeN\ndXK3T1uBFKNkiUDxpGlA0ANTjC6P19F8jfy1rR+9tHs3ffNDSlVP+6iWqQKBgFCq\nLVPXFAqeXXsanrCr7NLMWgLjhUAngmzNgwCsV+av3L4vXtTHrn+CTWBTyJBDP7Xh\nMCFdtVdCATJaEaulh+XK8TkzKjRcxhiGOHk7yBj+A4bjt9GafXwirI5KZFD8qLaz\nNRQ8+vTrvC+mR3iZG4tmPWjLQOKlhQ8AAGae1I5lAoGAQ8Vu4FlmQvs4rANVsLO2\nHiACyuThgMecN3T0otwz8Y9SBRKYvbRVZSBNDxTz5IZMvSGHcyvhnxMwudU91zi0\nTdzMnp7BB3//Z3uFKTQa2+OUdjhA7oPj/xUXJ9YLtaiaSOMBTNKc/eNwe1cclxpJ\nU9+wnhK7V0kqruF8VbgDgPY=\n-----END PRIVATE KEY-----\n",
    "client_email": "trivia-questions@trivia-app-198811.iam.gserviceaccount.com",
    "client_id": "111099916554905284091",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://accounts.google.com/o/oauth2/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/trivia-questions%40trivia-app-198811.iam.gserviceaccount.com"
}
const QUESTIONS_SPREADSHEET_URL = '1q8HU-yYrBaXWdMTFM8goYmBAEQX1FtYhU3vDe3V31_o'

module.exports =  { QUESTIONS_SPREADSHEET_URL, SPREADSHEET_CREDENTIALS }
