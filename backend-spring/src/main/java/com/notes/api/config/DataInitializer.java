package com.notes.api.config;

import com.notes.api.entity.Note;
import com.notes.api.entity.User;
import com.notes.api.repository.NoteRepository;
import com.notes.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEMO_EMAIL = "demo@example.com";
    private static final String DEMO_PASSWORD = "password123";

    @Override
    @Transactional
    public void run(String... args) {
        initializeDemoUser();
    }

    private void initializeDemoUser() {
        if (userRepository.existsByEmail(DEMO_EMAIL)) {
            log.info("✅ Compte démo déjà existant : {}", DEMO_EMAIL);
            return;
        }

        try {
            // Créer l'utilisateur démo
            User demoUser = User.builder()
                    .email(DEMO_EMAIL)
                    .passwordHash(passwordEncoder.encode(DEMO_PASSWORD))
                    .build();

            demoUser = userRepository.save(demoUser);
            log.info("✅ Compte démo créé automatiquement : {} / {}", DEMO_EMAIL, DEMO_PASSWORD);

            // Créer 3 notes privées pour l'utilisateur démo
            createDemoNotes(demoUser);
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création du compte démo : {}", e.getMessage());
        }
    }

    private void createDemoNotes(User demoUser) {
        try {
            // Note 1 : Bienvenue
            Note note1 = Note.builder()
                    .owner(demoUser)
                    .title("Bienvenue dans Notes")
                    .contentMd("# Bienvenue !\n\nCeci est votre première note. Vous pouvez :\n\n- **Créer** de nouvelles notes\n- **Éditer** vos notes existantes\n- **Partager** vos notes avec d'autres utilisateurs\n- **Créer des liens publics** pour partager sans authentification\n\nProfitez de l'application !")
                    .visibility(Note.Visibility.PRIVATE)
                    .tags(new HashSet<>())
                    .build();
            noteRepository.save(note1);

            // Note 2 : Guide Markdown
            Note note2 = Note.builder()
                    .owner(demoUser)
                    .title("Guide Markdown")
                    .contentMd("# Guide Markdown\n\n## Formatage de texte\n\n- **Gras** : `**texte**`\n- *Italique* : `*texte*`\n- `Code` : `` `code` ``\n\n## Listes\n\n1. Premier élément\n2. Deuxième élément\n3. Troisième élément\n\n## Liens\n\n[Exemple de lien](https://example.com)\n\n## Citations\n\n> Ceci est une citation")
                    .visibility(Note.Visibility.PRIVATE)
                    .tags(new HashSet<>())
                    .build();
            noteRepository.save(note2);

            // Note 3 : Notes de travail
            Note note3 = Note.builder()
                    .owner(demoUser)
                    .title("Notes de travail")
                    .contentMd("# Notes de travail\n\n## Tâches à faire\n\n- [ ] Tâche 1\n- [ ] Tâche 2\n- [x] Tâche terminée\n\n## Idées\n\n- Idée importante 1\n- Idée importante 2\n\n## Remarques\n\nNotez vos pensées et réflexions ici.")
                    .visibility(Note.Visibility.PRIVATE)
                    .tags(new HashSet<>())
                    .build();
            noteRepository.save(note3);

            log.info("✅ 3 notes privées créées automatiquement pour le compte démo");
        } catch (Exception e) {
            log.error("❌ Erreur lors de la création des notes démo : {}", e.getMessage());
        }
    }
}

