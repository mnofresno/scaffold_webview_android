package com.example.webviewapp;

import android.content.Context;
import android.content.res.AssetManager;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

import java.io.IOException;

public class DirListing extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        WebView webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient());

        String dirListingHtml = generateDirectoryListingHtml(this);

        webView.loadDataWithBaseURL(null, dirListingHtml, "text/html", "UTF-8", null);
    }

    private String generateDirectoryListingHtml(Context context) {
        AssetManager assetManager = context.getAssets();
        StringBuilder htmlBuilder = new StringBuilder();
        htmlBuilder.append("<html><body><h1>Directory Listing</h1><ul>");

        try {
            String[] files = assetManager.list("");
            if (files != null) {
                for (String file : files) {
                    htmlBuilder.append("<li>").append(file).append("</li>");
                }
            } else {
                htmlBuilder.append("<li>No files found</li>");
            }
        } catch (IOException e) {
            htmlBuilder.append("<li>Error reading assets</li>");
        }

        htmlBuilder.append("</ul></body></html>");
        return htmlBuilder.toString();
    }
}
